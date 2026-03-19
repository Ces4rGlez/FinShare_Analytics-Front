const Button = ({ onClick, children, variant = 'primary' }) => {
  const styles = {
    primary: { 
      backgroundColor: '#3da886', 
      color: 'white', 
      padding: '12px 24px', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      transition: 'all 0.2s',
      margin: '0 0.5rem'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--text-h)',
      padding: '12px 24px',
      border: '2px solid var(--accent-border)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      transition: 'all 0.2s'
    }
  };

  return (
    <button 
      style={styles[variant]} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

