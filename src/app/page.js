"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Scene from "@/components/Scene";
import ProfilePanel from "@/components/ProfilePanel";
import AddMemberModal from "@/components/AddMemberModal";

export default function Home() {
  const [members, setMembers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members`);
      const data = await res.json();
      setMembers(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const handleAddOrUpdateMember = async (formData, id) => {
    try {
      if (id) {
        // Update existing member
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members/${id}`, {
          method: 'PUT',
          body: formData,
        });
        if (res.ok) {
          let updatedMember = await res.json();
          updatedMember = updatedMember.data;
          setMembers((prev) => prev.map((m) => (m.id === id ? updatedMember : m)));
          if (selectedMember && selectedMember.id === id) {
            setSelectedMember(updatedMember);
          }
        }
      } else {
        // Create new member
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          // let newMember = await res.json();
          // newMember = newMember.data;
          // setMembers((prev) => [...prev, newMember]);
           await fetchMembers();
        }
      }
    } catch (error) {
      console.error("Failed to save member", error);
    }

    setIsAddModalOpen(false);
    setMemberToEdit(null);
  };

  const handleDeleteMember = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-members/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // setMembers((prev) => prev.filter((m) => m.id !== id));
        if (selectedMember && selectedMember.id === id) {
          handleClosePanel();
        }
         await fetchMembers();
      }
    } catch (error) {
      console.error("Failed to delete member", error);
    }
  };

  const openAddModal = () => {
    setMemberToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setIsAddModalOpen(true);
  };

  const handleClosePanel = () => {
    setSelectedMember(null);
    // Unpause conveyor
    window.dispatchEvent(
      new CustomEvent("set-conveyor-pause", { detail: { paused: false } })
    );
  };

  return (
    <>
      <Navbar onAddMember={openAddModal} />
      <Hero memberCount={members.length} />
      <Scene
        members={members}
        onSelectMember={(member) => setSelectedMember(member)}
      />

      <ProfilePanel
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={handleClosePanel}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setMemberToEdit(null);
        }}
        onAdd={handleAddOrUpdateMember}
        initialData={memberToEdit}
      />

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">ARMATRIX</span>
          <span className="footer-copy">
            © 2026 Armatrix Robotics. All systems operational.
          </span>
        </div>
      </footer>
    </>
  );
}
