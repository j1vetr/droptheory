import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export interface PlacementBurst {
  id: number;
  x: number;
  y: number;
  color: string;
  cellSize: number;
}

interface Props {
  bursts: PlacementBurst[];
}

const PARTICLES_PER_BURST = 4;

export default function PlacementSparks({ bursts }: Props) {
  if (bursts.length === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bursts.map((b) => (
        <Burst key={b.id} burst={b} />
      ))}
    </View>
  );
}

function Burst({ burst }: { burst: PlacementBurst }) {
  const particles = React.useMemo(() => {
    const cs = burst.cellSize;
    return Array.from({ length: PARTICLES_PER_BURST }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = cs * (0.7 + Math.random() * 0.6);
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - cs * 0.25,
        size: Math.max(4, cs * (0.16 + Math.random() * 0.08)),
        rot: (Math.random() - 0.5) * 220,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: burst.x,
        top: burst.y,
        width: 0,
        height: 0,
      }}
    >
      {particles.map((p, i) => (
        <SparkParticle
          key={i}
          dx={p.dx}
          dy={p.dy}
          size={p.size}
          rot={p.rot}
          color={burst.color}
        />
      ))}
    </View>
  );
}

function SparkParticle({
  dx,
  dy,
  size,
  rot,
  color,
}: {
  dx: number;
  dy: number;
  size: number;
  rot: number;
  color: string;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    tx.value = withTiming(dx, { duration: 480, easing: Easing.out(Easing.quad) });
    ty.value = withTiming(dy, { duration: 480, easing: Easing.out(Easing.quad) });
    rotation.value = withTiming(rot, { duration: 480 });
    opacity.value = withTiming(0, { duration: 480, easing: Easing.in(Easing.quad) });
    scale.value = withTiming(0.5, { duration: 480 });
  }, [dx, dy, rot, tx, ty, rotation, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 2,
        },
        animStyle,
      ]}
    />
  );
}
