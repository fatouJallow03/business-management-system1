
import { useState } from "react";
import { Eye, EyeOff, UserRound } from "lucide-react";
import Input from "../../input/Input";
import type { OwnerData, UpdateOwner } from "./types";
import styles from "./RegisterForm.module.scss";

type Props = {
  owner: OwnerData;
  updateOwner: UpdateOwner;
};

export default function OwnerAccountStep({
  owner,
  updateOwner,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeading}>
        <h1>Create your owner account</h1>
        <p>You'll use these details to sign in to Walo.</p>
      </div>

      <div className={styles.sectionHeading}>
        <UserRound size={19} aria-hidden="true" />
        <h2>Account details</h2>
      </div>

      <div className={styles.fields}>
        <Input
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={owner.username}
          onChange={(event) =>
            updateOwner("username", event.target.value)
          }
          autoComplete="username"
          required
        />

        <Input
          label="Your email address"
          type="email"
          name="ownerEmail"
          placeholder="you@example.com"
          value={owner.email}
          onChange={(event) =>
            updateOwner("email", event.target.value)
          }
          autoComplete="email"
          required
        />

        <div className={styles.passwordField}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a secure password"
            value={owner.password}
            onChange={(event) =>
              updateOwner("password", event.target.value)
            }
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
