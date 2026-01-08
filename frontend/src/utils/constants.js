export const LOAN_TYPES = [
  { id: 'personal', name: 'Personal Loan', icon: '💰' },
  { id: 'home', name: 'Home Loan', icon: '🏠' },
  { id: 'car', name: 'Car Loan', icon: '🚗' },
  { id: 'education', name: 'Education Loan', icon: '🎓' },
  { id: 'business', name:  'Business Loan', icon: '💼' }
];

export const LOAN_PROVIDERS = [
  'RISKOFF Bank',
  'ICICI Bank',
  'SBI',
  'HDFC Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda'
];

export const RISK_CATEGORIES = {
  LOW: { color: 'green', label: 'Low Risk', decision: 'Auto Approve' },
  MEDIUM: { color: 'yellow', label: 'Medium Risk', decision: 'Manual Review' },
  HIGH: { color: 'red', label: 'High Risk', decision:  'Auto Reject' }
};

export const GRIEVANCE_TYPES = [
  { id:  'rejection_query', name: 'Loan Rejection Query' },
  { id: 'delay', name: 'Processing Delay' },
  { id: 'document', name: 'Document Issue' },
  { id: 'other', name: 'Other' }
];

export const SCORE_GRADES = [
  { min: 750, max: 900, grade: 'Excellent', color: 'green' },
  { min: 650, max: 749, grade: 'Good', color: 'blue' },
  { min: 550, max: 649, grade: 'Fair', color: 'yellow' },
  { min: 400, max: 549, grade: 'Poor', color: 'orange' },
  { min: 0, max: 399, grade: 'Very Poor', color: 'red' }
];

export const SPENDING_CATEGORIES = [
  { id:  'food', name: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#8B5CF6' },
  { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#3B82F6' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#10B981' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#EC4899' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#EF4444' },
  { id:  'education', name: 'Education', icon: '📚', color: '#6366F1' },
  { id:  'other', name: 'Other', icon: '📦', color: '#6B7280' }
];