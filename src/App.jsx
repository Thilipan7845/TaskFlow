import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={
            <Landing />
          }
        />


        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/signup"
          element={
            <Signup />
          }
        />


        {/* =========================================
            DASHBOARD
        ========================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            MY TASKS
        ========================================= */}

        <Route
          path="/dashboard/tasks"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADD TASK
        ========================================= */}

        <Route
          path="/dashboard/add-task"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            AI ASSISTANT
        ========================================= */}

        <Route
          path="/dashboard/ai-assistant"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            DEPENDENCIES
        ========================================= */}

        <Route
          path="/dashboard/dependencies"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            COLLABORATION
        ========================================= */}

        <Route
          path="/dashboard/collaboration"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            INVITATIONS
        ========================================= */}

        <Route
          path="/dashboard/invitations"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            PRODUCTIVITY
        ========================================= */}

        <Route
          path="/dashboard/productivity"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            PLANNER
        ========================================= */}

        <Route
          path="/dashboard/planner"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            PERFORMANCE
        ========================================= */}

        <Route
          path="/dashboard/performance"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;