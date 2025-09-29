
export interface Task {
  id: string;
  title: string;
  description?: string;
  scheduledTime: string; // HH:MM format
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  isActive: boolean; // Whether this task should appear now
  assignedUsers?: string[]; // User IDs who can complete this task
}

export interface DailyAssignment {
  date: string; // YYYY-MM-DD format
  morningResponsible: string;
  eveningResponsible: string;
}

export interface CompletedTask {
  id: string;
  taskId: string;
  title: string;
  completedAt: Date;
  completedBy: string;
  completedByUserId: string;
  date: string;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export interface AppState {
  currentUser: User;
  users: User[];
  tasks: Task[];
  dailyAssignments: DailyAssignment[];
  completedTasks: CompletedTask[];
  lastResetDate: string;
  isAuthenticated: boolean;
}
