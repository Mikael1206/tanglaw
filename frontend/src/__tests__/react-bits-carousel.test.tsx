import React, { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ReactBitsCarousel, {
  type CarouselRef,
  type CarouselItemData,
} from "../components/ui/ReactBitsCarousel";

const mockItems: CarouselItemData[] = [
  {
    id: 1,
    number: "01",
    title: "Item One",
    description: "Description for item one",
  },
  {
    id: 2,
    number: "02",
    title: "Item Two",
    description: "Description for item two",
  },
  {
    id: 3,
    number: "03",
    title: "Item Three",
    description: "Description for item three",
  },
];

describe("ReactBitsCarousel", () => {
  it("renders carousel items with title, description, and number", () => {
    render(<ReactBitsCarousel items={mockItems} baseWidth={400} loop={false} />);

    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.getByText("Description for item one")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("exposes imperative methods via ref", () => {
    const ref = createRef<CarouselRef>();
    render(<ReactBitsCarousel ref={ref} items={mockItems} baseWidth={400} loop={false} />);

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.goTo).toBe("function");
    expect(typeof ref.current?.next).toBe("function");
    expect(typeof ref.current?.prev).toBe("function");
  });

  it("allows navigating via ref methods", () => {
    const ref = createRef<CarouselRef>();
    let activeIdx = 0;
    render(
      <ReactBitsCarousel
        ref={ref}
        items={mockItems}
        baseWidth={400}
        loop={false}
        onActiveIndexChange={(idx) => {
          activeIdx = idx;
        }}
      />
    );

    act(() => {
      ref.current?.goTo(1);
    });

    expect(ref.current?.activeIndex).toBe(1);
    expect(activeIdx).toBe(1);
  });
});
