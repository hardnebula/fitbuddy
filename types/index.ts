export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalCheckIns: number;
  bestStreak: number;
  currentStreak: number;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  groupStreak: number;
  inviteCode: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  photo?: string;
  note?: string;
}

export interface DayCheckIn {
  date: string; // YYYY-MM-DD
  checkedIn: boolean;
  checkIn?: CheckIn;
}

