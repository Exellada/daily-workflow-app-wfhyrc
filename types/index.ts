
export interface Task {
  id: string;
  title: string;
  description?: string;
  scheduledTime: string; // HH:MM format
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  isActive: boolean; // Whether this task should appear now
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
  date: string;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface AppState {
  currentUser: User;
  tasks: Task[];
  dailyAssignments: DailyAssignment[];
  completedTasks: CompletedTask[];
  lastResetDate: string;
}
