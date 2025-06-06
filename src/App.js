import "./App.css";
import { useState } from "react";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import RoleControls from "./RoleControls";

function App() {
  const [role, setRole] = useState("");

  if (!role) {
    return (
      <div className="role-selection">
        <h2>Select Your Role</h2>
        <select
          aria-label="Select Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="judge">Judge</option>
          <option value="speaker">Speaker</option>
          <option value="moderator">Moderator</option>
          <option value="audience">Audience</option>
        </select>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <RoleControls role={role} />
      <HMSPrebuilt roomCode="aue-gnov-bkt" />
    </div>
  );
}

export default App;
