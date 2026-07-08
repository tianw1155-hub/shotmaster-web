import { create } from 'zustand';

export type PermissionType = 'camera' | 'photos';

export type PermissionGrantType = 'permanent' | 'whileUsing' | 'denied' | 'notAsked';

export interface PermissionState {
  permissions: Record<PermissionType, PermissionGrantType>;
  isRequesting: boolean;
  pendingRequestType: PermissionType | null;
  resolveFn: ((granted: boolean) => void) | null;
  
  requestPermission: (type: PermissionType) => Promise<boolean>;
  setPermission: (type: PermissionType, grantType: PermissionGrantType) => void;
  checkPermission: (type: PermissionType) => boolean;
  resetPermission: (type: PermissionType) => void;
  hasGrantedAny: (type: PermissionType) => boolean;
  resolvePendingRequest: (granted: boolean) => void;
}

const STORAGE_KEY = 'shotmaster_permissions';

function loadPermissions(): Record<PermissionType, PermissionGrantType> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return {
    camera: 'notAsked',
    photos: 'notAsked',
  };
}

function savePermissions(permissions: Record<PermissionType, PermissionGrantType>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
  } catch {
    // ignore
  }
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: loadPermissions(),
  isRequesting: false,
  pendingRequestType: null,
  resolveFn: null,
  
  setPermission: (type, grantType) => {
    set((state) => {
      const newPermissions = { ...state.permissions, [type]: grantType };
      savePermissions(newPermissions);
      return { permissions: newPermissions };
    });
  },
  
  checkPermission: (type) => {
    const { permissions } = get();
    return permissions[type] === 'permanent' || permissions[type] === 'whileUsing';
  },
  
  hasGrantedAny: (type) => {
    const { permissions } = get();
    return permissions[type] !== 'notAsked' && permissions[type] !== 'denied';
  },
  
  resetPermission: (type) => {
    get().setPermission(type, 'notAsked');
  },
  
  resolvePendingRequest: (granted) => {
    const { resolveFn, pendingRequestType } = get();
    if (resolveFn) {
      resolveFn(granted);
      set({ resolveFn: null, pendingRequestType: null });
    }
  },
  
  requestPermission: async (type) => {
    const { permissions, checkPermission, setPermission } = get();
    
    if (checkPermission(type)) {
      return true;
    }
    
    if (permissions[type] === 'denied') {
      return false;
    }
    
    if (permissions[type] === 'permanent') {
      return true;
    }
    
    return new Promise((resolve) => {
      set({ 
        isRequesting: true, 
        pendingRequestType: type, 
        resolveFn: resolve 
      });
    });
  },
}));