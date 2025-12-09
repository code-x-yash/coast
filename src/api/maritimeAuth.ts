import { User, maritimeApi } from './maritimeMockApi';

const SESSION_KEY = 'maritime_training_session';

export interface AuthResponse {
  token: string;
  user: User;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomDelay = () => Math.random() * 600 + 200;

export const maritimeAuth = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    await delay(getRandomDelay());

    const user = await maritimeApi.findUserByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.password_hash !== password && user.password_hash !== 'hashed_password') {
      throw new Error('Invalid email or password');
    }

    const token = `maritime-token-${Date.now()}`;
    const session = { token, user };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  async signOut(): Promise<void> {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  },

  async signUpStudent(formData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    dgshipping_id?: string;
    rank?: string;
    coc_number?: string;
    date_of_birth?: string;
    nationality?: string;
  }): Promise<AuthResponse> {
    await delay(getRandomDelay());

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUser = await maritimeApi.findUserByEmail(formData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = await maritimeApi.createUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'student',
      password_hash: formData.password,
    });

    await maritimeApi.createStudent({
      userid: newUser.userid,
      dgshipping_id: formData.dgshipping_id,
      rank: formData.rank,
      coc_number: formData.coc_number,
      date_of_birth: formData.date_of_birth,
      nationality: formData.nationality || 'Indian',
    });

    const token = `maritime-token-${Date.now()}`;
    const session = { token, user: newUser };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  async registerInstitute(formData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    instituteName: string;
    accreditation_no: string;
    valid_from: string;
    valid_to: string;
    address?: string;
    city?: string;
    state?: string;
    documents?: any[];
  }): Promise<AuthResponse> {
    await delay(getRandomDelay());

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUser = await maritimeApi.findUserByEmail(formData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = await maritimeApi.createUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: 'institute',
      password_hash: formData.password,
    });

    await maritimeApi.createInstitute({
      userid: newUser.userid,
      name: formData.instituteName,
      accreditation_no: formData.accreditation_no,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to,
      contact_email: formData.email,
      contact_phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      documents: formData.documents || [],
    });

    const token = `maritime-token-${Date.now()}`;
    const session = { token, user: newUser };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  getSession(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      console.warn('Failed to parse session');
    }
    return null;
  },

  async switchUser(userid: string): Promise<AuthResponse> {
    await delay(300);

    const user = await maritimeApi.findUserById(userid);
    if (!user) {
      throw new Error('User not found');
    }

    const token = `maritime-token-${Date.now()}`;
    const session = { token, user };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },
};
