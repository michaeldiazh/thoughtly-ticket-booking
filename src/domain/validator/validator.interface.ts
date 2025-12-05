/**
 * Validator Interface
 * 
 * Defines the contract for validators that can validate unknown data
 * and convert it to a typed result
 */

/**
 * Interface for validators that validate unknown data to a specific type
 * @template T - The type that the validator will validate to
 */
export interface Validator<T> {
  /**
   * Validates unknown data and returns the validated typed result
   * 
   * @param data - The unknown data to validate
   * @returns The validated data of type T
   * @throws Error if validation fails
   */
  validate(data: unknown): T;
}
