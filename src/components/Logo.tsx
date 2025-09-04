interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`font-bold text-foreground ${sizeClasses[size]} ${className}`}>
      <span className="text-purple-accent">Byte</span>
      <span className="text-foreground"> Toolkit</span>
    </div>
  );
};