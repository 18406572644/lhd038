import { createTheme } from '@mantine/core';

export const cyberpunkTheme = createTheme({
  primaryColor: 'neonPink',
  colors: {
    neonPink: [
      '#FF2E97', '#FF2E97', '#FF2E97', '#FF2E97', '#FF2E97',
      '#FF2E97', '#FF2E97', '#FF2E97', '#FF2E97', '#FF2E97',
    ],
    electricBlue: [
      '#00F0FF', '#00F0FF', '#00F0FF', '#00F0FF', '#00F0FF',
      '#00F0FF', '#00F0FF', '#00F0FF', '#00F0FF', '#00F0FF',
    ],
    deepBlack: [
      '#0A0A14', '#0A0A14', '#0A0A14', '#0A0A14', '#0A0A14',
      '#0A0A14', '#0A0A14', '#0A0A14', '#0A0A14', '#0A0A14',
    ],
    darkPurple: [
      '#1A0A2E', '#1A0A2E', '#1A0A2E', '#1A0A2E', '#1A0A2E',
      '#1A0A2E', '#1A0A2E', '#1A0A2E', '#1A0A2E', '#1A0A2E',
    ],
    neonYellow: [
      '#FFE600', '#FFE600', '#FFE600', '#FFE600', '#FFE600',
      '#FFE600', '#FFE600', '#FFE600', '#FFE600', '#FFE600',
    ],
    darkGray: [
      '#1E1E2E', '#1E1E2E', '#1E1E2E', '#1E1E2E', '#1E1E2E',
      '#1E1E2E', '#1E1E2E', '#1E1E2E', '#1E1E2E', '#1E1E2E',
    ],
  },
  fontFamily: 'Rajdhani, sans-serif',
  headings: {
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    NumberInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    Slider: {
      defaultProps: {
        size: 'sm',
      },
    },
  },
});
