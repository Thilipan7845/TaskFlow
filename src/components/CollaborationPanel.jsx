import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  ShieldCheck,
  Loader2,
  Clock3,
  UserCheck,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

function CollaborationPanel({ task }) {
  const [
    collaborators,
    setCollaborators,
  ] = useState([]);

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  // =========================================
  // LOAD COLLABORATORS
  // =========================================

  useEffect(() => {
    let cancelled = false;

    async function loadCollaborators() {
      if (!task?.id) {
        if (!cancelled) {
          setCollaborators([]);
          setLoading(false);
        }

        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError("");
        setSuccessMessage("");
      }

      try {
        const {
          data,
          error: loadError,
        } = await supabase
          .from(
            "task_collaborators"
          )
          .select("*")
          .eq(
            "task_id",
            task.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (loadError) {
          throw loadError;
        }

        if (!cancelled) {
          setCollaborators(
            data || []
          );
        }
      } catch (err) {
        console.error(
          "Collaborator loading error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load collaborators."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCollaborators();

    return () => {
      cancelled = true;
    };
  }, [task?.id]);

  // =========================================
  // VALIDATE EMAIL
  // =========================================

  function isValidEmail(value) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      value
    );
  }

  // =========================================
  // ADD COLLABORATOR
  // =========================================

  async function addCollaborator() {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    setError("");
    setSuccessMessage("");

    if (!cleanEmail) {
      setError(
        "Please enter an email address."
      );

      return;
    }

    if (
      !isValidEmail(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    setSaving(true);

    try {
      // =====================================
      // GET CURRENT USER
      // =====================================

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "You must be logged in to invite collaborators."
        );
      }

      // =====================================
      // PREVENT SELF INVITATION
      // =====================================

      if (
        cleanEmail ===
        user.email?.toLowerCase()
      ) {
        throw new Error(
          "You cannot invite yourself."
        );
      }

      // =====================================
      // PREVENT DUPLICATES
      // =====================================

      const alreadyAdded =
        collaborators.some(
          (person) =>
            person
              .collaborator_email
              ?.toLowerCase() ===
            cleanEmail
        );

      if (alreadyAdded) {
        throw new Error(
          "This email has already been invited to this task."
        );
      }

      // =====================================
      // CHECK REGISTERED USER
      // =====================================

      const {
        data: matchingUser,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            "id, email"
          )
          .eq(
            "email",
            cleanEmail
          )
          .maybeSingle();

      if (profileError) {
        console.error(
          "Profile lookup error:",
          profileError
        );

        throw new Error(
          "Unable to check the invited user."
        );
      }

      // =====================================
      // CREATE INVITATION
      // =====================================

      const {
        data,
        error: insertError,
      } =
        await supabase
          .from(
            "task_collaborators"
          )
          .insert([
            {
              task_id:
                task.id,

              owner_id:
                user.id,

              collaborator_email:
                cleanEmail,

              collaborator_user_id:
                matchingUser?.id ||
                null,

              role:
                "member",

              // Every invitation
              // starts as pending.
              status:
                "pending",
            },
          ])
          .select()
          .single();

      if (insertError) {
        throw insertError;
      }

      // =====================================
      // UPDATE UI
      // =====================================

      setCollaborators(
        (current) => [
          ...current,
          data,
        ]
      );

      setEmail("");

      if (matchingUser) {
        setSuccessMessage(
          "Invitation created. This TaskFlow user can accept it from their invitations page."
        );
      } else {
        setSuccessMessage(
          "Invitation is pending. The user has not registered with TaskFlow yet."
        );
      }

    } catch (err) {
      console.error(
        "Invite collaborator error:",
        err
      );

      setError(
        err.message ||
          "Unable to create invitation."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // REMOVE COLLABORATOR
  // =========================================

  async function removeCollaborator(
    collaboratorId
  ) {
    setError("");
    setSuccessMessage("");

    setRemovingId(
      collaboratorId
    );

    try {
      const {
        error: deleteError,
      } =
        await supabase
          .from(
            "task_collaborators"
          )
          .delete()
          .eq(
            "id",
            collaboratorId
          );

      if (deleteError) {
        throw deleteError;
      }

      setCollaborators(
        (current) =>
          current.filter(
            (person) =>
              person.id !==
              collaboratorId
          )
      );

      setSuccessMessage(
        "Collaborator removed successfully."
      );

    } catch (err) {
      console.error(
        "Remove collaborator error:",
        err
      );

      setError(
        err.message ||
          "Unable to remove collaborator."
      );
    } finally {
      setRemovingId(null);
    }
  }

  // =========================================
  // GET STATUS LABEL
  // =========================================

  function getStatusLabel(
    person
  ) {
    if (
      person.status ===
      "active"
    ) {
      return "Active member";
    }

    if (
      person.status ===
      "declined"
    ) {
      return "Invitation declined";
    }

    return "Invitation pending";
  }

  // =========================================
  // GET STATUS ICON
  // =========================================

  function renderStatusIcon(
    person
  ) {
    if (
      person.status ===
      "active"
    ) {
      return (
        <ShieldCheck
          size={15}
        />
      );
    }

    if (
      person.status ===
      "declined"
    ) {
      return (
        <Clock3
          size={15}
        />
      );
    }

    return (
      <Mail
        size={15}
      />
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <section className="collaboration-panel">

      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div className="collaboration-panel-header">

        <div className="collaboration-icon-box">

          <Users size={24} />

        </div>

        <div>

          <p>
            TEAMWORK
          </p>

          <h3>
            Collaborators
          </h3>

          <span>
            Invite teammates and work
            together on this task.
          </span>

        </div>

      </div>

      {/* =================================== */}
      {/* ERROR */}
      {/* =================================== */}

      {error && (

        <div className="collaboration-error">

          {error}

        </div>

      )}

      {/* =================================== */}
      {/* SUCCESS */}
      {/* =================================== */}

      {successMessage && (

        <div className="collaboration-success">

          <ShieldCheck
            size={17}
          />

          <span>
            {successMessage}
          </span>

        </div>

      )}

      {/* =================================== */}
      {/* INVITE SECTION */}
      {/* =================================== */}

      <div className="collaboration-invite-section">

        <div className="collaboration-invite-title">

          <div className="collaboration-invite-icon">

            <UserPlus
              size={19}
            />

          </div>

          <div>

            <h4>
              Invite a teammate
            </h4>

            <p>
              Enter their TaskFlow account
              email address.
            </p>

          </div>

        </div>

        <div className="collaboration-invite-row">

          <div className="collaboration-email-input">

            <Mail size={19} />

            <input
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                setError("");
                setSuccessMessage("");
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !saving
                ) {
                  event.preventDefault();

                  addCollaborator();
                }
              }}
            />

          </div>

          <button
            type="button"
            className="collaboration-invite-button"
            onClick={
              addCollaborator
            }
            disabled={
              saving ||
              !email.trim()
            }
          >

            {saving ? (

              <>

                <Loader2
                  size={17}
                  className="collaboration-spinner"
                />

                Inviting...

              </>

            ) : (

              <>

                <UserPlus
                  size={17}
                />

                Send Invite

              </>

            )}

          </button>

        </div>

      </div>

      {/* =================================== */}
      {/* MEMBERS */}
      {/* =================================== */}

      <div className="collaboration-members-section">

        <div className="collaboration-members-header">

          <div>

            <h4>
              Team Members
            </h4>

            <p>
              People invited to this task.
            </p>

          </div>

          <span>

            {collaborators.length}

          </span>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="collaboration-loading">

            <Loader2
              size={22}
              className="collaboration-spinner"
            />

            Loading collaborators...

          </div>

        ) : collaborators.length ===
          0 ? (

          /* EMPTY */

          <div className="collaboration-empty">

            <div className="collaboration-empty-icon">

              <Users
                size={30}
              />

            </div>

            <h4>
              No collaborators yet
            </h4>

            <p>
              Invite teammates to start
              collaborating on this task.
            </p>

          </div>

        ) : (

          /* LIST */

          <div className="collaboration-member-list">

            {collaborators.map(
              (person) => (

                <div
                  key={person.id}
                  className="collaboration-member"
                >

                  {/* LEFT */}

                  <div className="collaboration-member-left">

                    <div className="collaboration-avatar">

                      {person
                        .collaborator_email
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}

                    </div>

                    <div className="collaboration-member-info">

                      <strong>

                        {
                          person.collaborator_email
                        }

                      </strong>

                      <span
                        className={
                          `collaboration-status collaboration-status-${person.status}`
                        }
                      >

                        {renderStatusIcon(
                          person
                        )}

                        {getStatusLabel(
                          person
                        )}

                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className="collaboration-member-actions">

                    {person
                      .collaborator_user_id && (

                      <div
                        className="collaboration-user-badge"
                        title="Registered TaskFlow user"
                      >

                        <UserCheck
                          size={15}
                        />

                        TaskFlow User

                      </div>

                    )}

                    <button
                      type="button"
                      className="collaboration-remove-button"
                      onClick={() =>
                        removeCollaborator(
                          person.id
                        )
                      }
                      disabled={
                        removingId ===
                        person.id
                      }
                      title="Remove collaborator"
                    >

                      {removingId ===
                      person.id ? (

                        <Loader2
                          size={17}
                          className="collaboration-spinner"
                        />

                      ) : (

                        <Trash2
                          size={17}
                        />

                      )}

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </section>
  );
}

export default CollaborationPanel;