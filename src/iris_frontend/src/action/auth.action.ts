import { authService, type UserProfile } from '../services/auth.service';

export interface AuthState {
  isLoggedIn: boolean;
  selectedRole: 'Customer' | 'Merchant' | null;
  loading: boolean;
  userProfile: UserProfile | null;
}

export const initAuthState: AuthState = {
  isLoggedIn: false,
  selectedRole: null,
  loading: true,
  userProfile: null,
};

export const authActions = {
  async initAuth(setState: (state: Partial<AuthState>) => void) {
    try {
      setState({ loading: true });
      
      await authService.init();
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        setState({ isLoggedIn: true });
        
        const profile = await authService.getUserProfile();
        if (profile) {
          setState({ 
            userProfile: profile, 
            selectedRole: profile.role 
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setState({ loading: false });
    }
  },

  async handleLogin(setState: (state: Partial<AuthState>) => void) {
    try {
      setState({ loading: true });
      
      await authService.login();
      setState({ isLoggedIn: true });
      
      const profile = await authService.getUserProfile();
      if (profile) {
        setState({ 
          userProfile: profile, 
          selectedRole: profile.role 
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setState({ loading: false });
    }
  },

  async handleLogout(setState: (state: Partial<AuthState>) => void) {
    await authService.logout();
    setState({
      isLoggedIn: false,
      selectedRole: null,
      userProfile: null,
    });
  },

  async handleRoleSelect(
    role: 'Customer' | 'Merchant',
    setState: (state: Partial<AuthState>) => void
  ) {
    try {
      setState({ loading: true });
      
      const profile = await authService.registerUser(role);
      setState({
        selectedRole: role,
        userProfile: profile,
      });
      
      console.log(`Successfully registered as ${role}`);
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setState({ loading: false });
    }
  },

  getPrincipalString(): string | undefined {
    return authService.getPrincipal()?.toString();
  },
};