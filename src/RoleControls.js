import React from "react";

function RoleControls({ role }) {
  if (role === "judge") {
    return (
      <div className="role-controls">
        <button>Score Speaker</button>
      </div>
    );
  }
  if (role === "speaker") {
    return (
      <div className="role-controls">
        <button>Speak</button>
      </div>
    );
  }
  if (role === "moderator") {
    return (
      <div className="role-controls">
        <button>Moderate Room</button>
      </div>
    );
  }
  return null;
}

export default RoleControls;
