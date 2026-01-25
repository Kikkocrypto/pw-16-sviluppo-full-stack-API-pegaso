/**
 * Esempio di componente React riutilizzabile
 * 
 * Questo è un esempio base. Puoi creare componenti più complessi
 * seguendo questa struttura.
 */

function ExampleComponent({ title, children }) {
  return (
    <div className="example-component">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export default ExampleComponent;
