# Armatrix Team Page – Frontend

This is the frontend implementation of the Armatrix Team Page assignment.  
It is built using **Next.js** and **React** and communicates with the **FastAPI backend** to fetch and manage team member data.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <https://github.com/shraddhaHS/TeamPage-frontend>
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env.local` file and add the backend API URL

```
NEXT_PUBLIC_API_URL=<backend-url>
```

### 4. Run the development server

```bash
npm run dev
```

The application will run at:

```
http://localhost:3000
```

---

## Design Decisions

### Robotic-Arm-Themed Element

While working on the team page assignment for armatrix, my main intention was to design something that reflects the spirit of the product your company is building. Since armatrix develops robotic arms capable of performing multiple industrial tasks such as painting, welding, and other automated operations, I wanted the design itself to subtly echo that idea. My vision was to creatively incorporate the concept of a robotic arm and automation into the layout of the team page. Specifically, I imagined the robotic arm controlling a conveyor belt system where each team member’s card would appear as if it were being carried along the belt, moving left or right as the mechanism operates. The idea was to present the team members sequentially, almost like items in a production line, symbolizing precision, movement, and automation—qualities that align with the nature of your product. Although the current implementation is a simplified version due to time constraints, the core inspiration behind the design was to reinterpret the robotic arm’s real-world industrial functionality into an interactive visual element within the website.

## Notes

* The frontend dynamically fetches team member data from the backend API.
* CRUD functionality is available through a **modal form** for adding, editing, and deleting team members.
* The UI is **responsive** and works across desktop and mobile screens.

---

## Deployment

Frontend deployed on **Vercel**:

```
<
https://team-page-frontend.vercel.app/
>
```




