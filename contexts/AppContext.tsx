
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, Task, DailyAssignment, CompletedTask, UserRole } from '../types';

// Simple UUID generator for now
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

interface AppContextType {
  appState: AppState;
  updateTasks: (tasks: Task[]) => void;
  completeTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'isActive'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setDailyAssignment: (assignment: DailyAssignment) => void;
  switchUserRole: (role: UserRole) => void;
  getCurrentActiveTasks: () => Task[];
  // User management
  addUser: (name: string, password: string, role: UserRole) => Promise<boolean>;
  authenticateUser: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  canUserCompleteTask: (taskId: string) => boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'workflow_app_state';

const defaultAdminUser: User = {
  id: '1',
  name: 'Администратор',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date(),
};

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Проверить оборудование',
    description: 'Убедиться, что все оборудование работает правильно',
    scheduledTime: '09:00',
    completed: false,
    isActive: false,
    assignedUsers: [],
  },
  {
    id: '2',
    title: 'Обновить отчеты',
    description: 'Подготовить ежедневные отчеты',
    scheduledTime: '14:00',
    completed: false,
    isActive: false,
    assignedUsers: [],
  },
  {
    id: '3',
    title: 'Проверить безопасность',
    description: 'Провести проверку безопасности',
    scheduledTime: '18:00',
    completed: false,
    isActive: false,
    assignedUsers: [],
  },
];

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: defaultAdminUser,
    users: [defaultAdminUser],
    tasks: defaultTasks,
    dailyAssignments: [],
    completedTasks: [],
    lastResetDate: getTodayString(),
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    loadAppState();
  }, []);

  // Auto-reset at 23:00
  useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const today = getTodayString();
      
      if (now.getHours() >= 23 && appState.lastResetDate !== today) {
        console.log('Resetting checklist for new day');
        resetDailyTasks();
      }
    };

    const interval = setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [appState.lastResetDate]);

  // Update active tasks based on current time
  useEffect(() => {
    const updateActiveTasks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setAppState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => ({
          ...task,
          isActive: !task.completed && task.scheduledTime <= currentTime,
        })),
      }));
    };

    updateActiveTasks();
    const interval = setInterval(updateActiveTasks, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadAppState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsedState.completedTasks = parsedState.completedTasks.map((task: any) => ({
          ...task,
          completedAt: new Date(task.completedAt),
        }));
        parsedState.users = parsedState.users.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }));
        setAppState(parsedState);
      }
    } catch (error) {
      console.log('Error loading app state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAppState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.log('Error saving app state:', error);
    }
  };

  const resetDailyTasks = () => {
    const today = getTodayString();
    const newState = {
      ...appState,
      tasks: appState.tasks.map(task => ({
        ...task,
        completed: false,
        isActive: false,
        completedAt: undefined,
        completedBy: undefined,
      })),
      lastResetDate: today,
    };
    setAppState(newState);
    saveAppState(newState);
  };

  const updateTasks = (tasks: Task[]) => {
    const newState = { ...appState, tasks };
    setAppState(newState);
    saveAppState(newState);
  };

  const canUserCompleteTask = (taskId: string): boolean => {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    // Admin can complete any task
    if (appState.currentUser.role === 'admin') return true;
    
    // If no specific users assigned, any authenticated user can complete
    if (!task.assignedUsers || task.assignedUsers.length === 0) {
      return appState.currentUser.role !== 'viewer';
    }
    
    // Check if current user is assigned to this task
    return task.assignedUsers.includes(appState.currentUser.id);
  };

  const completeTask = (taskId: string) => {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task || !canUserCompleteTask(taskId)) {
      console.log('User cannot complete this task');
      return;
    }

    const completedTask: CompletedTask = {
      id: generateId(),
      taskId: task.id,
      title: task.title,
      completedAt: new Date(),
      completedBy: appState.currentUser.name,
      completedByUserId: appState.currentUser.id,
      date: getTodayString(),
    };

    const newState = {
      ...appState,
      tasks: appState.tasks.map(t =>
        t.id === taskId
          ? { 
              ...t, 
              completed: true, 
              completedAt: new Date(), 
              completedBy: appState.currentUser.name 
            }
          : t
      ),
      completedTasks: [...appState.completedTasks, completedTask],
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'isActive'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      completed: false,
      isActive: false,
      assignedUsers: taskData.assignedUsers || [],
    };

    const newState = {
      ...appState,
      tasks: [...appState.tasks, newTask],
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const newState = {
      ...appState,
      tasks: appState.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const deleteTask = (taskId: string) => {
    const newState = {
      ...appState,
      tasks: appState.tasks.filter(t => t.id !== taskId),
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const setDailyAssignment = (assignment: DailyAssignment) => {
    const existingIndex = appState.dailyAssignments.findIndex(
      a => a.date === assignment.date
    );

    let newAssignments;
    if (existingIndex >= 0) {
      newAssignments = [...appState.dailyAssignments];
      newAssignments[existingIndex] = assignment;
    } else {
      newAssignments = [...appState.dailyAssignments, assignment];
    }

    const newState = {
      ...appState,
      dailyAssignments: newAssignments,
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const switchUserRole = (role: UserRole) => {
    const roleNames = {
      admin: 'Администратор',
      user: 'Пользователь',
      viewer: 'Наблюдатель',
    };

    const newState = {
      ...appState,
      currentUser: {
        ...appState.currentUser,
        role,
        name: roleNames[role],
      },
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const addUser = async (name: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = appState.users.find(u => u.name.toLowerCase() === name.toLowerCase());
      if (existingUser) {
        console.log('User already exists');
        return false;
      }

      const newUser: User = {
        id: generateId(),
        name,
        password,
        role,
        createdAt: new Date(),
      };

      const newState = {
        ...appState,
        users: [...appState.users, newUser],
      };

      setAppState(newState);
      await saveAppState(newState);
      return true;
    } catch (error) {
      console.log('Error adding user:', error);
      return false;
    }
  };

  const authenticateUser = async (name: string, password: string): Promise<boolean> => {
    try {
      const user = appState.users.find(u => 
        u.name.toLowerCase() === name.toLowerCase() && u.password === password
      );

      if (user) {
        const newState = {
          ...appState,
          currentUser: user,
          isAuthenticated: true,
        };
        setAppState(newState);
        await saveAppState(newState);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error authenticating user:', error);
      return false;
    }
  };

  const logout = () => {
    const newState = {
      ...appState,
      currentUser: defaultAdminUser,
      isAuthenticated: false,
    };
    setAppState(newState);
    saveAppState(newState);
  };

  const deleteUser = (userId: string) => {
    if (userId === '1') return; // Cannot delete default admin

    const newState = {
      ...appState,
      users: appState.users.filter(u => u.id !== userId),
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const newState = {
      ...appState,
      users: appState.users.map(u =>
        u.id === userId ? { ...u, ...updates } : u
      ),
    };

    setAppState(newState);
    saveAppState(newState);
  };

  const getCurrentActiveTasks = (): Task[] => {
    return appState.tasks.filter(task => task.isActive && !task.completed);
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        updateTasks,
        completeTask,
        addTask,
        updateTask,
        deleteTask,
        setDailyAssignment,
        switchUserRole,
        getCurrentActiveTasks,
        addUser,
        authenticateUser,
        logout,
        deleteUser,
        updateUser,
        canUserCompleteTask,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
