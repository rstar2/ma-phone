import BoringAvatar, { AvatarProps as BoringAvatarProps } from "boring-avatars";

const avatarOpts = {
    size: 40,
    variant: "beam",
    colors: ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
  } satisfies BoringAvatarProps;
  

type AvatarProps = {
    name: string;
    size?: number;
}
export default function Avatar({name, size}: AvatarProps) {
    return <BoringAvatar {...avatarOpts} name={name} size={size}/>
}