import { motion } from "framer-motion";

export const animatedDiv = ({children, className}) =>{
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, delay: 1 }}
            transition={{
                ease: 'easeInOut',
                duration: 0.7,
                delay: 0.15,
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export default animatedDiv;
