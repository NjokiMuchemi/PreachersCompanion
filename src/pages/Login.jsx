import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import brandHero from "../assets/brand-hero.png";
import brandLogo from "../assets/brandLogo.png";
import { colors } from "../theme/companionTheme";
import {
formBox,
inputStyle,
forgotWrapper,
forgotLinkStyle,
buttonStyle,
dividerRow,
dividerLine,
dividerText,
bottomTextStyle,
linkStyle,
goldText,
poweredBox,
initiativeText,
heroPanel,
heroImage,
heroOverlay,
heroTextBlock,
heroKicker,
heroBigTitle,
heroIntro,
featureBar,
featureItem,
featureItemLast,
featureIcon,
featureTitle,
featureText,
} from "../styles/loginStyles";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  }
  
  return (
    <div style={pageStyle}>
      <main style={loginShell}>
        <section style={formPanel}>
          <div style={formContent}>
            <div style={brandHeader}>
  <img
    src={brandLogo}
    alt="Preacher's Companion"
    style={brandLogoStyle}
  />

  <div>
  <h1 style={brandTitle}>
    <span style={titleFirstWord}>PREACHER&apos;S</span> 
    <span style={titleSecondWord}>COMPANION</span>
  </h1>
</div>
</div>

            <div style={headlineBlock}>
              <h2 style={mainHeadline}>
                From Revelation To Proclamation
              </h2>

              <p style={scriptureStyle}>
                “He who has my word, let him speak my word faithfully.”
                <br />
                <strong>Jeremiah 23:28</strong>
              </p>
            </div>

            <div style={formBox}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />

              <div style={forgotWrapper}>
                <Link to="/forgot-password" style={forgotLinkStyle}>
                  Forgot Password?
                </Link>
              </div>

              <button style={buttonStyle} onClick={handleLogin}>
                Login
              </button>
            </div>

            <div style={dividerRow}>
              <span style={dividerLine} />
              <span style={dividerText}>OR</span>
              <span style={dividerLine} />
            </div>

            <p style={bottomTextStyle}>
              Need access approval?{" "}
              <Link to="/signup" style={linkStyle}>
                Contact Admin
              </Link>
            </p>

            <div style={poweredBox}>
              <span style={initiativeText}>A SHE Ministers Forum Initiative</span>
              <br />
              Powered by Nebkona Investors Ltd – Technologies Division
              </div>
          </div>
        </section>

        <section style={heroPanel}>
          <img
            src={brandHero}
            alt="Preacher's Companion digital pulpit"
            style={heroImage}
          />
          <div style={heroOverlay} />

          <div style={heroTextBlock}>
            <p style={heroKicker}>The Digital</p>
            <h2 style={heroBigTitle}>Pulpit</h2>
            <p style={heroIntro}>
             Prepare sermons, preserve revelation and <br />
             Carry your ministry notes wherever you go.
             </p>
          </div>

          <div style={featureBar}>
            <div style={featureItem}>
              <div style={featureIcon}>📖</div>
              <strong style={featureTitle}>Plan</strong>
              <span style={featureText}>Your sermons effortlessly</span>
            </div>

            <div style={featureItem}>
              <div style={featureIcon}>☁️</div>
              <strong style={featureTitle}>Preserve</strong>
              <span style={featureText}>Messages safely</span>
            </div>

            <div style={featureItem}>
              <div style={featureIcon}>💻</div>
              <strong style={featureTitle}>Present</strong>
              <span style={featureText}>Access, Anywhere, Anytime</span>
            </div>

            <div style={featureItemLast}>
              <div style={featureIcon}> </div>
              <strong style={featureTitle}>Proclaim</strong>
              <span style={featureText}>Your Ministry Messages With confidence</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
