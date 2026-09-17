type AvatarProps = {
  name: string;
  image?: string | null;
  online?: boolean;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ name, image, online, size = "md" }: AvatarProps) {
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg" };
  return (
    <div className="relative shrink-0">
      {image ? (
        <img src={image} alt="" className={`${sizes[size]} rounded-2xl object-cover`} />
      ) : (
        <div className={`${sizes[size]} flex items-center justify-center rounded-2xl bg-indigo-100 font-semibold text-indigo-700`}>
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
    </div>
  );
}
