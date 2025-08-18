import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-100')
      expect(result).toBe('text-red-500 bg-blue-100')
    })

    it('handles conditional classes', () => {
      const result = cn('text-red-500', true && 'bg-blue-100', false && 'hidden')
      expect(result).toBe('text-red-500 bg-blue-100')
    })

    it('merges conflicting Tailwind classes correctly', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('handles arrays of classes', () => {
      const result = cn(['text-red-500', 'bg-blue-100'])
      expect(result).toBe('text-red-500 bg-blue-100')
    })

    it('handles objects with class conditions', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-100': false,
        'font-bold': true,
      })
      expect(result).toBe('text-red-500 font-bold')
    })

    it('handles empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles undefined and null values', () => {
      const result = cn('text-red-500', undefined, null, 'bg-blue-100')
      expect(result).toBe('text-red-500 bg-blue-100')
    })

    it('handles complex Tailwind merge scenarios', () => {
      // Test conflicting padding
      const result1 = cn('p-4', 'p-8')
      expect(result1).toBe('p-8')

      // Test conflicting margins
      const result2 = cn('m-2', 'mx-4')
      expect(result2).toBe('m-2 mx-4') // mx-4 overrides m-2 for x-axis

      // Test conflicting background colors
      const result3 = cn('bg-red-500', 'bg-blue-500')
      expect(result3).toBe('bg-blue-500')
    })

    it('preserves non-conflicting classes', () => {
      const result = cn('text-red-500', 'bg-blue-100', 'font-bold', 'hover:text-white')
      expect(result).toBe('text-red-500 bg-blue-100 font-bold hover:text-white')
    })

    it('handles responsive classes correctly', () => {
      const result = cn('text-sm', 'md:text-lg', 'lg:text-xl')
      expect(result).toBe('text-sm md:text-lg lg:text-xl')
    })

    it('handles state variants correctly', () => {
      const result = cn('text-gray-500', 'hover:text-blue-500', 'focus:text-green-500')
      expect(result).toBe('text-gray-500 hover:text-blue-500 focus:text-green-500')
    })

    it('handles dark mode variants', () => {
      const result = cn('text-gray-900', 'dark:text-gray-100')
      expect(result).toBe('text-gray-900 dark:text-gray-100')
    })

    it('handles complex conditional logic', () => {
      const isActive = true
      const isDisabled = false
      const variant = 'primary'

      const result = cn(
        'px-4 py-2 rounded',
        {
          'bg-blue-500 text-white': variant === 'primary',
          'bg-gray-500 text-white': variant === 'secondary',
          'opacity-50 cursor-not-allowed': isDisabled,
          'ring-2 ring-blue-300': isActive && !isDisabled,
        }
      )

      expect(result).toBe('px-4 py-2 rounded bg-blue-500 text-white ring-2 ring-blue-300')
    })

    it('handles mixed input types', () => {
      const result = cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-class-1': true,
          'object-class-2': false,
        },
        'string-class',
        undefined,
        null
      )

      expect(result).toBe('base-class array-class-1 array-class-2 object-class-1 string-class')
    })
  })
})