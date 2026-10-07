import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#666666"))
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 36, 20, page_text)
        self.drawString(36, 20, "FinSight AI Commerce — Interview Preparation Guide")
        self.setStrokeColor(colors.HexColor("#E0E0E0"))
        self.setLineWidth(0.5)
        self.line(36, 32, 612 - 36, 32)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    NAVY = colors.HexColor("#0F172A")
    AMBER = colors.HexColor("#B45309")
    BLUE_DARK = colors.HexColor("#1E3A8A")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER_COLOR = colors.HexColor("#CBD5E1")
    TEXT_DARK = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#475569")

    # Modify/Create Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=NAVY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=AMBER,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=BLUE_DARK,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    pitch_style = ParagraphStyle(
        'PitchText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=TEXT_DARK,
        spaceAfter=8
    )

    pitch_quote = ParagraphStyle(
        'PitchQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10.5,
        leading=16,
        textColor=NAVY,
        spaceBefore=6,
        spaceAfter=6
    )

    q_style = ParagraphStyle(
        'QuestionStyle',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    a_style = ParagraphStyle(
        'AnswerStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    story = []

    # Title Banner
    story.append(Paragraph("FinSight AI Commerce — Interview Guide", title_style))
    story.append(Paragraph("<b>Document Name:</b> How to Explain It in Interviews | <b>Author:</b> Full-Stack & AI Engineer", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=NAVY, spaceAfter=14))

    # Section 1: The Sweet Spot Pitch
    story.append(Paragraph("🎙️ The 90-Second 'Sweet Spot' Interview Pitch", h1_style))
    story.append(Paragraph("<i>Deliver this script when asked: 'Tell me about your project' or 'Walk me through a project you built.'</i>", pitch_style))
    
    pitch_box_content = [
        [Paragraph('<b>"Have you ever tried searching an e-commerce site for something specific—like <i>\'quiet headphones for coding in coffee shops under $200\'</i>—only to get zero results or random irrelevant products?</b>', pitch_quote)],
        [Paragraph('That happens because standard search engines only look for exact keywords. They can\'t process human context or budget caps together.', pitch_text_item if 'pitch_text_item' in locals() else pitch_style)],
        [Paragraph('To solve this, I built <b>FinSight AI Commerce</b>—an intelligent full-stack shopping platform.', pitch_style)],
        [Paragraph('<b>Here is how I engineered it:</b>', pitch_style)],
        [Paragraph('• <b>Understanding Context:</b> When a user types a prompt, my FastAPI backend uses <b>Llama 3 (via Groq)</b> to break the query down into structured intent, target use-cases, and exact price limits.', pitch_style)],
        [Paragraph('• <b>Smart Retrieval:</b> Instead of basic SQL search, I used <b>ChromaDB vector search</b> to find products by <i>meaning</i> rather than exact words, while enforcing hard metadata rules so budget limits are 100% strictly respected.', pitch_style)],
        [Paragraph('• <b>Financial Value:</b> The UI shows custom <b>\'Investment Tiers\'</b> (<i>Budget Pick, Mid-Range, Premium</i>) and an AI pitch explaining <i>why</i> a product is worth your money.', pitch_style)],
        [Paragraph('The biggest challenge was making sure the AI never hallucinated prices or broke search constraints. I solved this by engineering a <b>dual validation pipeline</b> with regex fallbacks and Pydantic schema validation.', pitch_style)],
        [Paragraph('I built the whole system end-to-end using <b>Next.js, Python, FastAPI, Docker, and GitHub Actions</b>, achieving sub-1 second search speeds."', pitch_quote)]
    ]

    pitch_table = Table(pitch_box_content, colWidths=[540])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    story.append(pitch_table)
    story.append(Spacer(1, 14))

    # Section 2: Why This Pitch Connects
    story.append(Paragraph("💡 Why This Pitch Connects with Interviewers", h1_style))
    
    table_data = [
        [Paragraph("<b>What You Say</b>", pitch_style), Paragraph("<b>What the Interviewer Hears</b>", pitch_style)],
        [Paragraph("<i>'Have you ever tried searching...?'</i>", pitch_style), Paragraph("<b>Hook & Relatability</b>: Immediately engages the interviewer with a common real-world frustration.", pitch_style)],
        [Paragraph("<i>'Llama 3 + ChromaDB Vector Search'</i>", pitch_style), Paragraph("<b>Modern AI Expertise</b>: Demonstrates production RAG (Retrieval-Augmented Generation) knowledge.", pitch_style)],
        [Paragraph("<i>'Enforcing hard metadata rules'</i>", pitch_style), Paragraph("<b>Production Mindset</b>: Proves you don't blindly trust LLMs; you sanitize & control AI outputs.", pitch_style)],
        [Paragraph("<i>'FastAPI, Next.js, Docker, CI/CD'</i>", pitch_style), Paragraph("<b>Full-Stack Competency</b>: Shows you can build, containerize, and ship robust software.", pitch_style)]
    ]

    why_table = Table(table_data, colWidths=[200, 340])
    why_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(why_table)
    story.append(Spacer(1, 16))

    # Section 3: Comprehensive Technical Q&A
    story.append(Paragraph("❓ Comprehensive Interview Q&A Guide", h1_style))
    story.append(Paragraph("<i>Be prepared to answer these follow-up technical questions confidently:</i>", pitch_style))

    qna_list = [
        ("Q1: Why use a Vector Database (ChromaDB) instead of traditional SQL full-text search?",
         "SQL full-text search requires exact string matching. If a user searches for 'headphones for noisy flights', SQL misses products described as 'noise-cancelling travel headsets'. ChromaDB converts text into 384-dimensional vector embeddings, allowing vector similarity search based on semantic meaning rather than literal words."),

        ("Q2: How does your Hybrid Search combine vector similarity with numerical filtering?",
         "Vector search alone cannot guarantee hard scalar constraints (e.g. price <= $200). In my backend, I pass a metadata filter dictionary into ChromaDB: `where={'price': {'$lte': max_budget}}`. This filters out non-compliant products first, then ranks the remaining items by vector similarity."),

        ("Q3: How do you handle LLM format errors or hallucinations?",
         "I built a two-tier safety net: (1) Strict Pydantic schema parsing (`CustomerIntent` model), and (2) a regex-based fallback extraction engine. If Groq returns non-JSON or extra text, the regex engine extracts `budget`, `category`, and `use_case` directly from the raw string. If the API fails completely, standard text retrieval runs without throwing a 500 server error."),

        ("Q4: Why FastAPI instead of Flask or Django?",
         "FastAPI leverages Python's native `async/await` syntax for high concurrency, auto-generates interactive Swagger API docs (/docs), and natively integrates with Pydantic for high-performance request/response data validation."),

        ("Q5: Why Groq / Llama 3 for LLM inference?",
         "Groq's LPU (Language Processing Unit) architecture delivers ultra-low inference latency (~500+ tokens/sec). This allows our intent extraction step to execute in under 200ms, keeping total end-to-end API response times under 1 second."),

        ("Q6: How is the frontend structured in Next.js 16?",
         "The frontend uses Next.js App Router with TypeScript and Tailwind CSS. It features a responsive grid, real-time intent badge indicators, slide-out shopping cart drawer with live subtotal calculation, and money category filters (Budget Pick, Mid-Range, Premium, Investment Grade)."),

        ("Q7: How did you containerize and deploy this application?",
         "The app uses Docker Compose to orchestrate two isolated containers: (1) FastAPI Python 3.11 backend service running uvicorn, and (2) Next.js Node environment frontend service. GitHub Actions automatically builds and verifies both containers on every git push.")
    ]

    for q, a in qna_list:
        item = []
        item.append(Paragraph(q, q_style))
        item.append(Paragraph(a, a_style))
        item.append(Spacer(1, 4))
        story.append(KeepTogether(item))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    out_dir = r"c:\Users\sell care\OneDrive\Desktop\ai-commerce-agent"
    pdf_path = os.path.join(out_dir, "how to explain it in interviews.pdf")
    build_pdf(pdf_path)
