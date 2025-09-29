
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, Task, DailyAssignment, CompletedTask, UserRole } from '../types';
import { v4 as uuidv4 } from 'react-native-uuid';

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
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'workflow_app_state';

const defaultUser: User = {
  id: '1',
  name: 'Администратор',
  role: 'admin',
};

const defaultTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Проверить оборудование',
    description: 'Убедиться, что все оборудование работает правильно',
    scheduledTime: '09:00',
    completed: false,
    isActive: false,
  },
  {
    id: uuidv4(),
    title: 'Обновить отчеты',
    description: 'Подготовить ежедневные отчеты',
    scheduledTime: '14:00',
    completed: false,
    isActive: false,
  },
  {
    id: uuidv4(),
    title: 'Проверить безопасность',
    description: 'Провести проверку безопасности',
    scheduledTime: '18:00',
    completed: false,
    isActive: false,
  },
];

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: defaultUser,
    tasks: defaultTasks,
    dailyAssignments: [],
    completedTasks: [],
    lastResetDate: getTodayString(),
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

  const completeTask = (taskId: string) => {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTask: CompletedTask = {
      id: uuidv4(),
      taskId: task.id,
      title: task.title,
      completedAt: new Date(),
      completedBy: appState.currentUser.name,
      date: getTodayString(),
    };

    const newState = {
      ...appState,
      tasks: appState.tasks.map(t =>
        t.id === taskId
          ? { ...t, completed: true, completedAt: new Date(), completedBy: appState.currentUser.name }
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
      id: uuidv4(),
      completed: false,
      isActive: false,
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
