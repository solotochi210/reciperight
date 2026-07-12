import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function PageWrapper({ children, className, animate = true }) {
  const inner = (
    <div className={cn('mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {inner}
    </motion.div>
  );
}
