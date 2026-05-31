import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ContactForm } from "@/components/public/contact-form"

global.fetch = jest.fn()

describe("ContactForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders all required fields", () => {
    render(<ContactForm />)
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/what would you like/i)).toBeInTheDocument()
  })

  it("shows success state after submission", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ detail: "Message sent." }),
    })

    render(<ContactForm />)

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: "John Doe" },
    })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(/what would you like/i), {
      target: { value: "Hello, I would like to discuss a project." },
    })

    fireEvent.click(screen.getByText(/send message/i))

    await waitFor(() => {
      expect(screen.getByText(/message received/i)).toBeInTheDocument()
    })
  })

  it("shows send button with loading state", async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    )

    render(<ContactForm />)
    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "john@example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText(/what would you like/i), {
      target: { value: "Long enough message here." },
    })
    fireEvent.click(screen.getByText(/send message/i))

    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })
})
