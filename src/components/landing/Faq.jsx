import { useState } from "react";

function FaqItem({ item, index, open, onToggle }) {
  const answerId = `faq-answer-${index}`;

  return (
    <article className={`faq-item ${open ? "is-open" : ""}`}>
      <button
        className="faq-q"
        type="button"
        aria-expanded={open}
        aria-controls={answerId}
        onClick={onToggle}
      >
        {item.question}
        <span className="faq-icon">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="faq-a" id={answerId}>
          {item.answer}
        </p>
      )}
    </article>
  );
}

function Faq({ items }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="section-pad">
      <div className="container">
        <div className="faq-header">
          <div>
            <span className="overline">Dúvidas frequentes</span>
            <h2 className="section-h no-margin">Perguntas frequentes</h2>
          </div>
          <a
            href="mailto:suporte@zelotech.com.br"
            className="btn btn-outline-navy btn-sm"
          >
            Falar com suporte
          </a>
        </div>
        <div className="faq-grid">
          {items.map((item, index) => {
            const open = openFaq === index;

            return (
              <FaqItem
                index={index}
                item={item}
                key={item.question}
                onToggle={() => setOpenFaq(open ? null : index)}
                open={open}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Faq;
