import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import App from '../../apps/ui/src/App.svelte';

describe('End-to-End Tests for Pipeline UI', () => {
  it('renders the main application component', () => {
    const { getByText } = render(App);
    expect(getByText('Welcome to the Video Orchestrator')).toBeInTheDocument();
  });

  it('navigates between tabs', async () => {
    const { getByText } = render(App);
    const tab1 = getByText('Tab 1');
    const tab2 = getByText('Tab 2');

    await fireEvent.click(tab1);
    expect(tab1).toHaveClass('active');

    await fireEvent.click(tab2);
    expect(tab2).toHaveClass('active');
  });

  it('displays error message on failed API call', async () => {
    // Mock API call to simulate failure
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API call failed'))
    );

    const { getByText } = render(App);
    expect(getByText('Error loading data')).toBeInTheDocument();
  });
});