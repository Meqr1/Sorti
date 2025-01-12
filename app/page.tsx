export default function Page() {
    let whatENV;
    const env = process.env.NODE_ENV;
    if (env === "development") {
        whatENV = "development";
    } else if (env === "production") {
        whatENV = "production";
    }
  return (
    <div>
    {whatENV}
    </div>
  );
}
