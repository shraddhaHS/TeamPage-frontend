"use client";

import { useEffect, useRef, useState } from "react";

const CARD_W = 200;
const CARD_GAP = 80;
const CARD_STRIDE = CARD_W + CARD_GAP;
const BELT_SPEED = 0.45; // px per frame
const INSPECT_ZONE = 0.5; // fraction of viewport width
const INSPECT_RANGE = 160; // px radius for inspection trigger
const ARM_SEGMENTS = 7;
const ARM_SEG_LEN = 54;
const ARM_BASE_Y_FRAC = 0.18; // arm root at 18% from top of scene
const ARM_HOVER_Y_FRAC = 0.85; // how far arm tip descends when inspecting

export default function Scene({ members, onSelectMember }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const cardsTrackRef = useRef(null);
    const scanBeamRef = useRef(null);
    const beltTopRef = useRef(null);
    const beltBotRef = useRef(null);
    const rollerLRef = useRef(null);
    const rollerRRef = useRef(null);

    // Animation state (refs to avoid re-renders)
    const offsetRef = useRef(0);
    const speedRef = useRef(BELT_SPEED);
    const pausedRef = useRef(false);
    const inspectingRef = useRef(0);
    const activeIndexRef = useRef(0);
    const scrollAccumRef = useRef(0);
    const jointsRef = useRef([]);
    const armTargetRef = useRef({ x: 0, y: 0 });
    const targetOffsetRef = useRef(0);

    // Render state for card styling
    const [inspectingIdx, setInspectingIdx] = useState(0);

    useEffect(() => {
        let animationFrameId;
        let canvasWidth = 0;
        let canvasHeight = 0;

        const initJoints = (width, height) => {
            const baseX = width * 0.5;
            const baseY = height * ARM_BASE_Y_FRAC;
            const joints = [];
            for (let i = 0; i <= ARM_SEGMENTS; i++) {
                joints.push({ x: baseX, y: baseY + i * (ARM_SEG_LEN * 0.4) });
            }
            jointsRef.current = joints;
            armTargetRef.current = {
                x: baseX,
                y: baseY + ARM_SEGMENTS * ARM_SEG_LEN * 0.5,
            };
        };

        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                canvasWidth = containerRef.current.offsetWidth;
                canvasHeight = containerRef.current.offsetHeight;
                canvasRef.current.width = canvasWidth;
                canvasRef.current.height = canvasHeight;
                if (jointsRef.current.length === 0) {
                    initJoints(canvasWidth, canvasHeight);
                }

                // Re-align the conveyor on resize so the active index stays in the inspection zone.
                targetOffsetRef.current = clampOffset(getOffsetForIndex(activeIndexRef.current));
            }
        };

        const drawSceneAmbience = () => {
            const sceneEl = containerRef.current;
            if (!sceneEl) return;
            let canvas2 = sceneEl.querySelector(".ambience-canvas");
            if (!canvas2) {
                canvas2 = document.createElement("canvas");
                canvas2.className = "ambience-canvas";
                canvas2.style.cssText =
                    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;";
                sceneEl.insertBefore(canvas2, sceneEl.firstChild);
            }

            const drawGrid = () => {
                canvas2.width = sceneEl.offsetWidth;
                canvas2.height = sceneEl.offsetHeight;
                const ctx2 = canvas2.getContext("2d");
                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                ctx2.strokeStyle = "rgba(255,255,255,0.025)";
                ctx2.lineWidth = 1;
                const step = 60;
                for (let x = 0; x < canvas2.width; x += step) {
                    ctx2.beginPath();
                    ctx2.moveTo(x, 0);
                    ctx2.lineTo(x, canvas2.height);
                    ctx2.stroke();
                }
                for (let y = 0; y < canvas2.height; y += step) {
                    ctx2.beginPath();
                    ctx2.moveTo(0, y);
                    ctx2.lineTo(canvas2.width, y);
                    ctx2.stroke();
                }
            };
            drawGrid();
            window.addEventListener("resize", drawGrid);
            return () => window.removeEventListener("resize", drawGrid);
        };

        // 1. SCROLL MECHANICS: intercept wheel events to move conveyor
        // Calculate how far the track must translate to bring a given card into the inspection zone (center).
        const getViewportCenterX = () => window.innerWidth * INSPECT_ZONE;
        const getCardCenterX = (index) => CARD_GAP + index * CARD_STRIDE + CARD_W * 0.5;
        const getOffsetForIndex = (index) => getViewportCenterX() - getCardCenterX(index);

        const clampOffset = (offset) => {
            if (members.length === 0) return 0;
            const min = getOffsetForIndex(members.length - 1);
            const max = getOffsetForIndex(0);
            return Math.max(min, Math.min(max, offset));
        };

        const setActiveIndex = (index) => {
            const bounded = Math.max(0, Math.min(members.length - 1, index));
            if (bounded === activeIndexRef.current) return;
            activeIndexRef.current = bounded;
            inspectingRef.current = bounded;
            setInspectingIdx(bounded);

            // Pulse scan beam on active change
            if (scanBeamRef.current) {
                scanBeamRef.current.classList.remove("active");
                void scanBeamRef.current.offsetWidth;
                scanBeamRef.current.classList.add("active");
            }

            targetOffsetRef.current = clampOffset(getOffsetForIndex(bounded));
        };

        const SCROLL_THRESHOLD = 450; // accumulate deltaY before moving to next profile

        const isSceneVisibleEnough = (rect) => {
            const vh = window.innerHeight;

            const visibleHeight =
                Math.min(rect.bottom, vh) - Math.max(rect.top, 0);

            const visibilityRatio = visibleHeight / rect.height;

            return visibilityRatio > 0.85; // activate when 60% of section is visible
        };

        const handleWheel = (e) => {
            if (pausedRef.current || members.length === 0) return;

            const sceneEl = containerRef.current;
            if (!sceneEl) return;

            const rect = sceneEl.getBoundingClientRect();
            if (!isSceneVisibleEnough(rect)) return;

            const delta = e.deltaY;
            if (delta === 0) return;

            // Reset accumulator when scroll direction changes
            if (Math.sign(delta) !== Math.sign(scrollAccumRef.current)) {
                scrollAccumRef.current = 0;
            }

            // Determine whether we are already at a boundary where page scroll should resume.
            const atStart = activeIndexRef.current === 0 && delta < 0;
            const atEnd = activeIndexRef.current === members.length - 1 && delta > 0;

            if (atStart || atEnd) {
                // Allow normal page scrolling when we are at the boundary
                scrollAccumRef.current = 0;
                return;
            }

            // Otherwise we are inside the conveyor range, so block page scroll
            e.preventDefault();

            // Consume scroll input gradually
            scrollAccumRef.current += delta;

            const direction = Math.sign(scrollAccumRef.current);
            if (direction === 0) return;

            if (Math.abs(scrollAccumRef.current) >= SCROLL_THRESHOLD) {
                const nextIndex = activeIndexRef.current + (direction > 0 ? 1 : -1);
                setActiveIndex(nextIndex);
                scrollAccumRef.current -= direction * SCROLL_THRESHOLD;
            }
        };

        // Needs { passive: false } to prevent default
        window.addEventListener('wheel', handleWheel, { passive: false });

        const conveyorTick = () => {
            if (!pausedRef.current) {
                // Smooth interpolation towards target offset (easing)
                offsetRef.current += (targetOffsetRef.current - offsetRef.current) * 0.1;
            }

            // Calculate pseudo "speed" based on how fast offset is actively changing, for animations
            const currentSpeed = Math.abs(targetOffsetRef.current - offsetRef.current) * 0.1;
            const isMoving = currentSpeed > 0.05 && !pausedRef.current;

            if (cardsTrackRef.current) {
                cardsTrackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
            }

            // Adjust animation duration depending on pseudo speed, or pause if still
            const animDur = (!isMoving || pausedRef.current)
                ? "999s" // effectively paused
                : `${Math.max(0.5, 32 / (currentSpeed / 0.5))}s`;

            if (beltTopRef.current && beltBotRef.current) {
                if (beltTopRef.current.style.animationDuration !== animDur) {
                    beltTopRef.current.style.animationDuration = animDur;
                    beltBotRef.current.style.animationDuration = animDur;
                }
            }

            const rollerDur = (!isMoving || pausedRef.current)
                ? "999s"
                : `${Math.max(0.1, 2 / (currentSpeed / 0.5))}s`;

            if (rollerLRef.current && rollerRRef.current) {
                if (rollerLRef.current.style.animationDuration !== rollerDur) {
                    rollerLRef.current.style.animationDuration = rollerDur;
                    rollerRRef.current.style.animationDuration = rollerDur;
                }
            }
        };

        const checkInspection = () => {
            // Inspection index is driven by scroll steps (setActiveIndex).
            // This function exists to keep the animation loop consistent.
        };

        const solveFABRIK = (targetX, targetY) => {
            const joints = jointsRef.current;
            if (joints.length === 0) return;
            const n = joints.length;
            const baseX = canvasWidth * 0.5;
            const baseY = canvasHeight * ARM_BASE_Y_FRAC;

            // Forward pass
            joints[n - 1].x = targetX;
            joints[n - 1].y = targetY;
            for (let i = n - 2; i >= 0; i--) {
                const dx = joints[i].x - joints[i + 1].x;
                const dy = joints[i].y - joints[i + 1].y;
                const len = Math.hypot(dx, dy) || 0.001;
                const scale = ARM_SEG_LEN / len;
                joints[i].x = joints[i + 1].x + dx * scale;
                joints[i].y = joints[i + 1].y + dy * scale;
            }

            // Backward pass
            joints[0].x = baseX;
            joints[0].y = baseY;
            for (let i = 1; i < n; i++) {
                const dx = joints[i].x - joints[i - 1].x;
                const dy = joints[i].y - joints[i - 1].y;
                const len = Math.hypot(dx, dy) || 0.001;
                const scale = ARM_SEG_LEN / len;
                joints[i].x = joints[i - 1].x + dx * scale;
                joints[i].y = joints[i - 1].y + dy * scale;
            }
        };

        const updateArmTarget = () => {
            const sceneH = canvasHeight;
            const sceneW = canvasWidth;
            let tx, ty;

            if (inspectingRef.current !== null) {
                const cardEl = document.getElementById(`card-${inspectingRef.current}`);
                if (cardEl && containerRef.current) {
                    const r = cardEl.getBoundingClientRect();
                    const sceneRect = containerRef.current.getBoundingClientRect();
                    tx = r.left + r.width / 2 - sceneRect.left;
                    ty = sceneH * ARM_HOVER_Y_FRAC;
                } else {
                    tx = sceneW * 0.5;
                    ty = sceneH * 0.62;
                }
            } else {
                const t = Date.now() / 3000;
                tx = sceneW * 0.5 + Math.sin(t) * sceneW * 0.12;
                ty = sceneH * 0.55;
            }

            armTargetRef.current.x += (tx - armTargetRef.current.x) * 0.04;
            armTargetRef.current.y += (ty - armTargetRef.current.y) * 0.04;
        };

        const drawArm = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            const joints = jointsRef.current;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            if (joints.length < 2) return;

            const bx = joints[0].x;
            const by = joints[0].y;

            // Draw mount bracket
            ctx.save();
            ctx.strokeStyle = "#3a3f4a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bx - 28, by - 24);
            ctx.lineTo(bx + 28, by - 24);
            ctx.stroke();
            ctx.fillStyle = "#22262d";
            ctx.strokeStyle = "#4a5060";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(bx - 20, by - 30, 40, 14, 4);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            for (let i = 0; i < joints.length - 1; i++) {
                const a = joints[i];
                const b = joints[i + 1];
                const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                const t = i / (joints.length - 1);
                const segW = 14 - t * 5;

                grad.addColorStop(0.0, "#4a5060");
                grad.addColorStop(0.4, "#6a7080");
                grad.addColorStop(0.6, "#3a3f4a");
                grad.addColorStop(1.0, "#2e3340");

                ctx.save();
                ctx.strokeStyle = grad;
                ctx.lineWidth = segW;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();

                ctx.strokeStyle = "rgba(188,197,209,0.12)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
                ctx.restore();

                ctx.save();
                const jg = ctx.createRadialGradient(a.x, a.y, 1, a.x, a.y, segW * 0.7);
                jg.addColorStop(0, "#6a7080");
                jg.addColorStop(0.5, "#454b58");
                jg.addColorStop(1, "#22262d");
                ctx.fillStyle = jg;
                ctx.beginPath();
                ctx.arc(a.x, a.y, segW * 0.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "rgba(188,197,209,0.2)";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }

            const tip = joints[joints.length - 1];
            const prev = joints[joints.length - 2];
            const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x);

            ctx.save();
            ctx.translate(tip.x, tip.y);
            ctx.rotate(angle + Math.PI / 2);

            ctx.fillStyle = "#2e3340";
            ctx.strokeStyle = "#c8a96e";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-8, 0, 16, 22, 3);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#c8a96e";
            ctx.fillRect(-10, 18, 5, 10);
            ctx.fillRect(5, 18, 5, 10);

            if (inspectingRef.current !== null) {
                const pulse = (Math.sin(Date.now() / 200) + 1) * 0.5;
                ctx.fillStyle = `rgba(200, 169, 110, ${0.5 + pulse * 0.5})`;
                ctx.beginPath();
                ctx.arc(0, 28, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(200, 169, 110, ${0.2 + pulse * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, 28);
                ctx.lineTo(0, 60);
                ctx.stroke();
            }
            ctx.restore();

            ctx.save();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = "rgba(90,96,112,0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx - 10, by - 24);
            ctx.bezierCurveTo(
                bx - 30,
                by + 40,
                joints[2].x - 20,
                joints[2].y,
                joints[2].x,
                joints[2].y
            );
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        };

        const animate = () => {
            conveyorTick();
            checkInspection();
            updateArmTarget();
            solveFABRIK(armTargetRef.current.x, armTargetRef.current.y);
            drawArm();
            animationFrameId = requestAnimationFrame(animate);
        };

        handleResize();

        // Initialize the conveyor to start at the first member and keep the chain attached.
        const initialOffset = clampOffset(getOffsetForIndex(0));
        targetOffsetRef.current = initialOffset;
        offsetRef.current = initialOffset;
        setInspectingIdx(0);
        inspectingRef.current = 0;
        activeIndexRef.current = 0;

        const cleanupGrid = drawSceneAmbience();
        window.addEventListener("resize", handleResize);
        animate();

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
            if (cleanupGrid) cleanupGrid();
        };
    }, [members]);

    // Expose pause/unpause to the parent via events or ref if needed
    // For now, handled internally based on interaction (e.g. clicking a card could pause?)
    // Actually, opening the modal pauses. Let's wire a global event or simply assume openPanel handles it
    useEffect(() => {
        const handlePause = (e) => {
            pausedRef.current = e.detail.paused;
        };
        window.addEventListener("set-conveyor-pause", handlePause);
        return () => window.removeEventListener("set-conveyor-pause", handlePause);
    }, []);

    const handleCardClick = (m, index) => {
        // Dispatch an event to pause animation
        window.dispatchEvent(
            new CustomEvent("set-conveyor-pause", { detail: { paused: true } })
        );
        onSelectMember(m, index);
    };

    const handleCardHover = (entering) => {
        speedRef.current = entering ? BELT_SPEED * 0.3 : BELT_SPEED;
    };

    return (
        <>
            <div className="stage-label-wrap">
                <div className="stage-label">
                    <span className="stage-dot"></span>ROBOTIC INSPECTION ACTIVE
                </div>
                <div className="stage-label">
                    <span className="stage-dot stage-dot-amber"></span>CONVEYOR SPEED: 0.4 m/s
                </div>
            </div>
            <div className="scene" id="scene" ref={containerRef}>
                <canvas id="armCanvas" className="arm-canvas" ref={canvasRef}></canvas>
                <div className="conveyor-system">
                    <div className="mount-bar"></div>
                    <div className="roller-assembly roller-left">
                        <div className="roller-housing">
                            <div className="roller" id="rollerL" ref={rollerLRef}></div>
                            <div className="roller-axle"></div>
                        </div>
                    </div>
                    <div className="roller-assembly roller-right">
                        <div className="roller-housing">
                            <div className="roller" id="rollerR" ref={rollerRRef}></div>
                            <div className="roller-axle"></div>
                        </div>
                    </div>
                    <div className="belt-track belt-top">
                        <div className="belt-surface" id="beltTop" ref={beltTopRef}></div>
                    </div>
                    <div className="belt-track belt-bottom">
                        <div className="belt-surface" id="beltBot" ref={beltBotRef}></div>
                    </div>
                    <div className="guide-rail guide-rail-top"></div>
                    <div className="guide-rail guide-rail-bottom"></div>
                    <div className="cards-track" id="cardsTrack" ref={cardsTrackRef}>
                        {members.map((m, i) => (
                            <div
                                key={m.id}
                                id={`card-${i}`}
                                className={`profile-card ${inspectingIdx === i ? "inspecting" : ""}`}
                                onMouseEnter={() => handleCardHover(true)}
                                onMouseLeave={() => handleCardHover(false)}
                                onClick={() => handleCardClick(m, i)}
                            >
                                <div className="card-body">
                                    <div className="card-id-tag">{m.id}</div>
                                    <div className="card-photo-wrap">
                                        <img
                                            className="card-photo"
                                            src={m.photo}
                                            alt={m.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    m.name
                                                )}&background=22262d&color=c8a96e&size=128`;
                                            }}
                                        />
                                        <div className="card-photo-ring"></div>
                                    </div>
                                    <div className="card-name">{m.name}</div>
                                    <div className="card-role">{m.role}</div>
                                </div>
                                <div className="card-platform"></div>
                            </div>
                        ))}
                    </div>
                    <div className="inspection-zone" id="inspectionZone">
                        <div className="zone-bracket zone-bracket-left"></div>
                        <div className="zone-bracket zone-bracket-right"></div>
                        <div className="scan-beam" id="scanBeam" ref={scanBeamRef}></div>
                        <div className="zone-label">INSPECTION ZONE</div>
                    </div>
                </div>
            </div>
        </>
    );
}
