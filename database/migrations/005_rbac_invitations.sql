CREATE TABLE IF NOT EXISTS rbac_invitations (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  student_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_rbac_invitations_course_id ON rbac_invitations(course_id);
CREATE INDEX IF NOT EXISTS idx_rbac_invitations_student_email ON rbac_invitations(student_email);
CREATE INDEX IF NOT EXISTS idx_rbac_invitations_status ON rbac_invitations(status);