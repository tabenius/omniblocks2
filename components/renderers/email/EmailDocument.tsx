import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container as REContainer,
  Preview,
} from "@react-email/components";

export const EmailDocument: React.FC<{
  preview?: string;
  children?: React.ReactNode;
}> = ({ preview, children }) => (
  <Html>
    <Head />
    {preview && <Preview>{preview}</Preview>}
    <Body
      style={{
        background: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      <REContainer style={{ maxWidth: "640px", margin: "0 auto", padding: "24px" }}>
        {children}
      </REContainer>
    </Body>
  </Html>
);
