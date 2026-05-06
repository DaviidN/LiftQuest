import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';
import { Plus } from 'lucide-react';

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders icon when icon prop is provided', () => {
        render(<Button icon={Plus}>With Icon</Button>);
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('applies the correct variant styles', () => {
        render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r from-btnPrimary-from to-btnPrimary-to');
    });

    it('applies the correct size styles', () => {
        render(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('py-3 px-6 text-lg');
    });

    it('applies disabled styles when disabled prop is true', () =>{
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toHaveClass('opacity-50 cursor-not-allowed');
        expect(screen.getByRole('button')).toBeDisabled();
    });
    
    it('does not apply disabled styles when disabled prop is false', () =>{
        render(<Button disabled={false}>Enabled</Button>);
        expect(screen.getByRole('button')).not.toHaveClass('opacity-50 cursor-not-allowed');
    });

    it('applies menu styles when menu prop is true', () =>{
        render(<Button menu>Menu Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('justify-start');
    });

    it('applies full width styles when fullWidth prop is true', () =>{
        render(<Button fullWidth>Full Width</Button>);
        expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click me</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
        const onClick = vi.fn();
        render(<Button disabled onClick={onClick}>Disabled</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });
});