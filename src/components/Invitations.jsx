import {
  useEffect,
  useState,
} from "react";

import {
  Mail,
  Check,
  X,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { supabase } from "../lib/supabase";


function Invitations() {

  // =========================================
  // STATE
  // =========================================

  const [
    invitations,
    setInvitations,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    processingId,
    setProcessingId,
  ] = useState(null);


  // =========================================
  // LOAD INVITATIONS
  // =========================================

  useEffect(() => {

    let cancelled = false;


    async function loadInvitations() {

      try {

        setLoading(true);

        setError("");


        // =====================================
        // GET CURRENT USER
        // =====================================

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase
            .auth
            .getUser();


        if (
          userError ||
          !user
        ) {

          throw new Error(
            "You must be logged in."
          );

        }


        // =====================================
        // LOAD PENDING INVITATIONS
        // =====================================

        const {
          data,
          error: invitationError,
        } =
          await supabase
            .from(
              "task_collaborators"
            )
            .select(`
              *,
              tasks (
                id,
                title,
                description,
                priority,
                due_date,
                status
              )
            `)
            .eq(
              "collaborator_email",
              user.email
                ?.trim()
                .toLowerCase()
            )
            .eq(
              "status",
              "pending"
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );


        if (
          invitationError
        ) {

          throw invitationError;

        }


        if (
          !cancelled
        ) {

          setInvitations(
            data || []
          );

        }

      } catch (err) {

        console.error(
          "Invitation loading error:",
          err
        );


        if (
          !cancelled
        ) {

          setError(
            err.message ||
              "Unable to load invitations."
          );

        }

      } finally {

        if (
          !cancelled
        ) {

          setLoading(
            false
          );

        }

      }

    }


    loadInvitations();


    return () => {

      cancelled = true;

    };

  }, []);


  // =========================================
  // ACCEPT INVITATION
  // =========================================

  async function acceptInvitation(
    invitation
  ) {

    try {

      setProcessingId(
        invitation.id
      );

      setError("");


      // =====================================
      // GET CURRENT USER
      // =====================================

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase
          .auth
          .getUser();


      if (
        userError ||
        !user
      ) {

        throw new Error(
          "You must be logged in."
        );

      }


      // =====================================
      // ACCEPT INVITATION
      // =====================================

      const {
        error: updateError,
      } =
        await supabase
          .from(
            "task_collaborators"
          )
          .update({

            collaborator_user_id:
              user.id,

            status:
              "active",

          })
          .eq(
            "id",
            invitation.id
          );


      if (
        updateError
      ) {

        throw updateError;

      }


      // =====================================
      // REMOVE FROM PENDING LIST
      // =====================================

      setInvitations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              invitation.id
          )
      );

    } catch (err) {

      console.error(
        "Accept invitation error:",
        err
      );


      setError(
        err.message ||
          "Unable to accept invitation."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  }


  // =========================================
  // DECLINE INVITATION
  // =========================================

  async function declineInvitation(
    invitation
  ) {

    try {

      setProcessingId(
        invitation.id
      );

      setError("");


      // =====================================
      // DELETE INVITATION
      // =====================================

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
            invitation.id
          );


      if (
        deleteError
      ) {

        throw deleteError;

      }


      // =====================================
      // REMOVE FROM UI
      // =====================================

      setInvitations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              invitation.id
          )
      );

    } catch (err) {

      console.error(
        "Decline invitation error:",
        err
      );


      setError(
        err.message ||
          "Unable to decline invitation."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  }


  // =========================================
  // FORMAT DATE
  // =========================================

  function formatDate(
    date
  ) {

    if (
      !date
    ) {

      return "Recently";

    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month:
          "short",

        day:
          "numeric",

        year:
          "numeric",
      }
    );

  }


  // =========================================
  // UI
  // =========================================

  return (

    <section className="invitations-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="section-heading">

        <div>

          <p className="section-label">
            TEAMWORK
          </p>


          <h2>
            Your Invitations
          </h2>


          <p>
            Review task collaboration
            invitations sent to you.
          </p>

        </div>


        <div className="invitations-count">

          <Mail size={18} />

          <span>
            {invitations.length}
          </span>

        </div>

      </div>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="invitations-error">

          {error}

        </div>

      )}


      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (

        <div className="invitations-loading">

          <Loader2
            size={26}
            className="invitations-spinner"
          />

          <span>
            Loading invitations...
          </span>

        </div>

      )}


      {/* =====================================
          EMPTY
      ====================================== */}

      {!loading &&
        invitations.length === 0 && (

          <div className="invitations-empty">


            <div className="invitations-empty-icon">

              <Mail size={34} />

            </div>


            <h3>
              No pending invitations
            </h3>


            <p>
              When someone invites you to
              collaborate on a task, the
              invitation will appear here.
            </p>

          </div>

        )}


      {/* =====================================
          INVITATION LIST
      ====================================== */}

      {!loading &&
        invitations.length > 0 && (

          <div className="invitations-list">


            {invitations.map(
              (invitation) => {


                const task =
                  invitation.tasks;


                const isProcessing =
                  processingId ===
                  invitation.id;


                return (

                  <div
                    key={
                      invitation.id
                    }
                    className="invitation-card"
                  >


                    {/* =====================
                        LEFT ICON
                    ====================== */}

                    <div className="invitation-icon">

                      <Users
                        size={25}
                      />

                    </div>


                    {/* =====================
                        CONTENT
                    ====================== */}

                    <div className="invitation-content">


                      <div className="invitation-top-row">


                        <div>

                          <p className="invitation-label">

                            TASK INVITATION

                          </p>


                          <h3>

                            {
                              task?.title ||
                              "Task"
                            }

                          </h3>

                        </div>


                        <div className="invitation-pending">

                          <Clock
                            size={15}
                          />

                          Pending

                        </div>

                      </div>


                      {/* TASK DESCRIPTION */}

                      {task?.description && (

                        <p className="invitation-description">

                          {
                            task.description
                          }

                        </p>

                      )}


                      {/* TASK DETAILS */}

                      <div className="invitation-details">


                        <span>

                          Priority:
                          {" "}

                          <strong>

                            {
                              task?.priority ||
                              "Not set"
                            }

                          </strong>

                        </span>


                        <span>

                          Status:
                          {" "}

                          <strong>

                            {
                              task?.status ||
                              "To Do"
                            }

                          </strong>

                        </span>


                        {task?.due_date && (

                          <span>

                            Due:
                            {" "}

                            <strong>

                              {
                                formatDate(
                                  task.due_date
                                )
                              }

                            </strong>

                          </span>

                        )}

                      </div>


                      {/* INVITED DATE */}

                      <p className="invitation-date">

                        Invitation received
                        {" "}

                        {
                          formatDate(
                            invitation.created_at
                          )
                        }

                      </p>


                      {/* =====================
                          ACTIONS
                      ====================== */}

                      <div className="invitation-actions">


                        {/* DECLINE */}

                        <button
                          type="button"
                          className="invitation-decline-button"
                          onClick={() =>
                            declineInvitation(
                              invitation
                            )
                          }
                          disabled={
                            isProcessing
                          }
                        >

                          {isProcessing ? (

                            <Loader2
                              size={17}
                              className="invitations-spinner"
                            />

                          ) : (

                            <X
                              size={17}
                            />

                          )}


                          Decline

                        </button>


                        {/* ACCEPT */}

                        <button
                          type="button"
                          className="invitation-accept-button"
                          onClick={() =>
                            acceptInvitation(
                              invitation
                            )
                          }
                          disabled={
                            isProcessing
                          }
                        >

                          {isProcessing ? (

                            <Loader2
                              size={17}
                              className="invitations-spinner"
                            />

                          ) : (

                            <Check
                              size={17}
                            />

                          )}


                          Accept Invitation

                        </button>

                      </div>


                    </div>

                  </div>

                );

              }
            )}


          </div>

        )}


      {/* =====================================
          INFO BOX
      ====================================== */}

      {!loading && (

        <div className="invitations-info">

          <div>

            <CheckCircle2
              size={19}
            />

            <span>

              Accept an invitation to become
              an active collaborator.

            </span>

          </div>


          <div>

            <XCircle
              size={19}
            />

            <span>

              Declined invitations will be
              removed permanently.

            </span>

          </div>

        </div>

      )}


    </section>

  );

}


export default Invitations;