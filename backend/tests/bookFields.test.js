import { describe, expect, it } from "vitest";
import { parseRating, parseReview } from "../utils/bookFields.js";

describe("bookFields", () => {
  describe("parseRating", () => {
    it("accepts valid ratings", () => {
      expect(parseRating(3)).toEqual({ value: 3 });
      expect(parseRating("5")).toEqual({ value: 5 });
    });

    it("accepts null to clear rating", () => {
      expect(parseRating(null)).toEqual({ value: null });
      expect(parseRating("")).toEqual({ value: null });
    });

    it("skips undefined values", () => {
      expect(parseRating(undefined)).toEqual({ skip: true });
    });

    it("rejects invalid ratings", () => {
      expect(parseRating(0).error).toBeTruthy();
      expect(parseRating(6).error).toBeTruthy();
      expect(parseRating("abc").error).toBeTruthy();
    });
  });

  describe("parseReview", () => {
    it("trims review text", () => {
      expect(parseReview("  Bra bok  ")).toEqual({ value: "Bra bok" });
    });

    it("converts empty review to null", () => {
      expect(parseReview("   ")).toEqual({ value: null });
      expect(parseReview(null)).toEqual({ value: null });
    });

    it("skips undefined values", () => {
      expect(parseReview(undefined)).toEqual({ skip: true });
    });
  });
});
