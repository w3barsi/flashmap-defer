export { };
 
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "teacher" | "student";
    };
  }
}
