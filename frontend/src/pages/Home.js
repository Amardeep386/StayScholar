import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 50 }
  }
};

const Home = () => {
  return (
    <motion.div
      className="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="hero">
        <motion.div
          className="hero-background"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="container hero-content-wrapper">
          <motion.div
            className="hero-glass-card"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          >
            <div className="hero-content">
              <span className="hero-tagline">Premium Student Living</span>
              <motion.h1 variants={itemVariants}>
                Elevate Your <br />
                <span className="hero-highlight">Student Life</span>
              </motion.h1>
              <motion.p className="hero-description" variants={itemVariants}>
                Discover highly-curated, verified living spaces designed for the modern scholar. Secure, stylish, and close to campus.
              </motion.p>
              <motion.div className="hero-buttons" variants={itemVariants}>
                <Link to="/accommodations">
                  <motion.button
                    className="btn-premium primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Explore Spaces
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    className="btn-premium secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="stats-minimal">
        <div className="container">
          <div className="stats-grid-minimal">
            {[
              { number: "500+", label: "Verified Listings" },
              { number: "12k+", label: "Happy Students" },
              { number: "25+", label: "Cities Covered" },
              { number: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="stat-box-minimal"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <span className="section-label">Experience The Difference</span>
          <h2 className="modern-title">Built for Modern Scholars</h2>

          <div className="features-grid">
            {[
              { icon: "⚡", title: "Instant Booking", desc: "Browse, tour, and book your entire semester in minutes, not days." },
              { icon: "🛡️", title: "Trust Verified", desc: "Every property is 50-point checked for safety, quality, and connectivity." },
              { icon: "🤖", title: "AI-Matching", desc: "Our neural engine finds rooms tailored to your personality and budget." },
              { icon: "✨", title: "Designer Spaces", desc: "Access exclusive, modern interiors curated for maximum productivity." },
              { icon: "🤝", title: "Community First", desc: "Join a network of motivated peers. Safe, social, and supportive." },
              { icon: "💎", title: "Premium Support", desc: "Concierge-level help for every student, every step of the way." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="modern-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="icon-sphere">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-modern">
        <div className="container">
          <motion.div
            className="cta-glass-container"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Ready to find your peace?</h2>
            <p>Join thousands of scholars who chose StayScholar for their academic journey.</p>
            <Link to="/register">
              <motion.button
                className="btn-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;

