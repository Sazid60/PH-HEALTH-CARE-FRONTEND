"use client"
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface HeartbeatLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  showIcon?: boolean;
}

export default function HeartbeatLoader({
  text = "Next Level healthcare...",
  size = "md",
  className = "",
  animated = true,
  showIcon = false,
}: HeartbeatLoaderProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  const textSizeClasses = {
    sm: "text-[10px]",
    md: "text-[13.6px]",
    lg: "text-[18px]",
    xl: "text-[24px]",
  };

  const iconSizeClasses = {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className} justify-center min-h-screen`}>
      {/* Main Container */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Pulsing Ring */}
        {animated && (
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-blue-500"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}

        {/* Static Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-blue-500" />

        {/* Inner Container with Heartbeat */}
        <div className="absolute inset-[15%] flex items-center justify-center">
          {showIcon ? (
            <motion.div
              animate={
                animated
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Activity
                className="text-blue-500"
                size={iconSizeClasses[size]}
                strokeWidth={2}
              />
            </motion.div>
          ) : (
            <svg
              className="w-full h-full"
              style={{ transform: "scaleX(-1)" }}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 58 58"
            >
              <motion.path
                d="M52.744 28.7694H46.7983C45.7505 28.7672 44.7309 29.1082 43.8953 29.7403C43.0597 30.3724 42.4541 31.2609 42.1712 32.2697L36.5372 52.3124C36.5009 52.4369 36.4252 52.5463 36.3214 52.6241C36.2177 52.7019 36.0915 52.744 35.9618 52.744C35.8321 52.744 35.7059 52.7019 35.6022 52.6241C35.4984 52.5463 35.4227 52.4369 35.3864 52.3124L22.1525 5.22645C22.1162 5.10195 22.0404 4.99259 21.9367 4.91478C21.8329 4.83697 21.7068 4.79491 21.5771 4.79491C21.4474 4.79491 21.3212 4.83697 21.2175 4.91478C21.1137 4.99259 21.038 5.10195 21.0017 5.22645L15.3677 25.2692C15.0859 26.2741 14.4839 27.1596 13.6532 27.7913C12.8224 28.423 11.8082 28.7665 10.7646 28.7694H4.79491"
                stroke="#3B82F6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                initial={animated ? { pathLength: 0, opacity: 0 } : {}}
                animate={
                  animated
                    ? {
                        pathLength: 1,
                        opacity: 1,
                      }
                    : {}
                }
                transition={{
                  pathLength: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.5,
                  },
                }}
              />
            </svg>
          )}
        </div>

        {/* Heartbeat Pulse Effect */}
        {animated && (
          <motion.div
            className="absolute inset-[15%] rounded-full bg-blue-500/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Text */}
      {text && (
        <motion.p
          className={`font-medium text-gray-600 text-center ${textSizeClasses[size]}`}
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}