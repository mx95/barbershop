"use client";



import type { ReactNode } from "react";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { useIntroMotion } from "@/lib/motion/intro-context";



const EASE = [0.22, 1, 0.36, 1] as const;



type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {

  children: ReactNode;

  delay?: number;

  y?: number;

  /** Animate when entering viewport (default). Set false for above-the-fold hero content. */

  inView?: boolean;

};



export function Reveal({

  children,

  className,

  delay = 0,

  y = 28,

  inView = true,

  ...props

}: RevealProps) {

  const reduceMotion = useReducedMotion();

  const { introReady, cycle } = useIntroMotion();



  if (reduceMotion) {

    return <div className={className}>{children}</div>;

  }



  if (!introReady) {

    return (

      <div className={className} style={{ opacity: 0 }} aria-hidden>

        {children}

      </div>

    );

  }



  const hidden = { opacity: 0, y };

  const visible = { opacity: 1, y: 0 };

  const motionKey = `reveal-${cycle}-${delay}-${inView ? "v" : "h"}`;



  if (inView) {

    return (

      <motion.div

        key={motionKey}

        className={className}

        initial={hidden}

        whileInView={visible}

        viewport={{ once: false, margin: "-60px" }}

        transition={{ duration: 0.7, delay, ease: EASE }}

        {...props}

      >

        {children}

      </motion.div>

    );

  }



  return (

    <motion.div

      key={motionKey}

      className={className}

      initial={hidden}

      animate={visible}

      transition={{ duration: 0.85, delay, ease: EASE }}

      {...props}

    >

      {children}

    </motion.div>

  );

}



export function StaggerReveal({

  children,

  className,

  stagger = 0.1,

}: {

  children: ReactNode;

  className?: string;

  stagger?: number;

}) {

  const reduceMotion = useReducedMotion();

  const { introReady, cycle } = useIntroMotion();



  if (reduceMotion || !introReady) {

    return (

      <div className={className} style={introReady ? undefined : { opacity: 0 }}>

        {children}

      </div>

    );

  }



  return (

    <motion.div

      key={`stagger-${cycle}`}

      className={className}

      initial="hidden"

      whileInView="visible"

      viewport={{ once: false, margin: "-40px" }}

      variants={{

        hidden: {},

        visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },

      }}

    >

      {children}

    </motion.div>

  );

}



export function StaggerItem({

  children,

  className,

}: {

  children: ReactNode;

  className?: string;

}) {

  const reduceMotion = useReducedMotion();

  const { introReady } = useIntroMotion();



  if (reduceMotion || !introReady) {

    return <div className={className}>{children}</div>;

  }



  return (

    <motion.div

      className={className}

      variants={{

        hidden: { opacity: 0, y: 22 },

        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },

      }}

    >

      {children}

    </motion.div>

  );

}

