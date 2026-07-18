import toast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 12px 40px rgba(17, 24, 39, 0.12)',
};

export const notify = {
  success(message) {
    return toast.success(message, {
      style: {
        ...baseStyle,
        background: '#ffffff',
        color: '#111827',
        border: '1px solid #E5E7EB',
      },
      iconTheme: { primary: '#10B981', secondary: '#ffffff' },
    });
  },

  error(message) {
    return toast.error(message, {
      style: {
        ...baseStyle,
        background: '#ffffff',
        color: '#111827',
        border: '1px solid #FECACA',
      },
      iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
    });
  },

  warning(message) {
    return toast(message, {
      icon: '⚠️',
      style: {
        ...baseStyle,
        background: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #FDE68A',
      },
    });
  },

  info(message) {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        ...baseStyle,
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
      },
    });
  },
};

export default notify;
