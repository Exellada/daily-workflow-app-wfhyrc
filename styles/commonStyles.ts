
import { StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const colors = {
  primary: '#162456',    // Material Blue
  secondary: '#193cb8',  // Darker Blue
  accent: '#64B5F6',     // Light Blue
  background: '#101824',  // Dark background
  backgroundAlt: '#162133',  // Darker background
  text: '#e3e3e3',       // Light text
  grey: '#90CAF9',       // Light Blue Grey
  card: '#193cb8',       // Dark card background
  success: '#4CAF50',    // Green
  warning: '#FF9800',    // Orange
  error: '#FF5252',      // Red
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: Math.min(800, screenWidth - 40),
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: Math.min(24, screenWidth * 0.06),
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    maxWidth: 400,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey + '30',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.text,
  },
  // Responsive helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Safe area helpers
  safeArea: {
    paddingTop: 20, // Fallback for devices without safe area
  },
  // Text styles
  heading1: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: '700',
    color: colors.text,
  },
  heading2: {
    fontSize: Math.min(24, screenWidth * 0.06),
    fontWeight: '600',
    color: colors.text,
  },
  heading3: {
    fontSize: Math.min(20, screenWidth * 0.05),
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: Math.min(16, screenWidth * 0.04),
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: colors.text,
    opacity: 0.7,
  },
  // Layout helpers
  flex1: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  // Shadow styles
  shadow: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  shadowLarge: {
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 6,
  },
});

// Responsive breakpoints
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Helper function to check if screen is mobile
export const isMobile = screenWidth < breakpoints.mobile;
export const isTablet = screenWidth >= breakpoints.mobile && screenWidth < breakpoints.desktop;
export const isDesktop = screenWidth >= breakpoints.desktop;

// Helper function for responsive values
export const responsive = (mobile: number, tablet?: number, desktop?: number) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet || mobile;
  return desktop || tablet || mobile;
};
