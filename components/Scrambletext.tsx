import gsap from "gsap";

import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import { useRef } from "react";

gsap.registerPlugin(ScrambleTextPlugin);

type Props = {
    text: string,
    color: string,
    className?: string
}

export default function TextScramble({ text, color = "#fff", className}: Props) {
    const textRef = useRef(null);
    const playScramble = () => {
        gsap.to(textRef.current, {
            duration: 0.6,
            scrambleText: {
                text: text,
                chars: "!@#$%^&*",
                revealDelay: 0.1,
                tweenLength: false,
            },
            ease: "power1.inOut",
        });

    };

    return (
        <div
            className={`text-scramble cursor-pointer ${className}`}
            onMouseEnter={playScramble}
        >
            <span ref={textRef} style={{ color }}>{text}</span>
        </div>

    );

}