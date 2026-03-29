export interface Target {
  _id: string;
  user: string;
  kindleEmail: string;
  label?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TargetsListResponse {
  status: string;
  results: number;
  data: Target[];
}

export interface TargetResponse {
  status: string;
  data: Target;
}

export interface CreateTargetBody {
  kindleEmail: string;
  label?: string;
}
