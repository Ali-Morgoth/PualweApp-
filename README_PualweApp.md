
# Pualwe Comunidades

## Descripción General

**Pualwe App Comunidades** es una aplicación web progresiva (PWA) desarrollada íntegramente en Next.js y Firebase, diseñada para fortalecer la gestión documental de comunidades indígenas del territorio de San Juan de la Costa, Chile.

La plataforma permite a cada comunidad almacenar su documentación privada en un entorno seguro y al mismo tiempo compartir libros históricos escaneados en una biblioteca pública comunitaria, promoviendo así el rescate, digitalización y difusión del conocimiento ancestral.

---

## Objetivos del Sistema

- Facilitar la gestión de archivos y documentos internos por comunidad.
- Fomentar la preservación de la memoria histórica de los pueblos originarios.
- Otorgar acceso privado y controlado a los documentos propios de cada comunidad.
- Proporcionar una biblioteca abierta donde se puedan publicar libros históricos relevantes.
- Brindar acceso universal desde dispositivos móviles, incluso en zonas rurales, mediante tecnología PWA.

---

## Características Técnicas

- 🔐 Autenticación por comunidad (Firebase Auth).
- 📁 Subida y almacenamiento de documentos en la nube (Firebase Storage).
- 📚 Biblioteca pública digital accesible sin registro.
- 📱 Diseño responsive adaptado a dispositivos móviles.
- ⚙️ Implementación como Progressive Web App (PWA) para instalación local.
- 🚀 Despliegue en producción mediante Vercel.

---

## Tecnologías Utilizadas

- **Lenguaje principal:** JavaScript (ES6+)
- **Frontend:** Next.js, React, Tailwind CSS, CSS
- **Backend y Base de Datos:** Firebase Firestore
- **Autenticación:** Firebase Authentication
- **Almacenamiento de Archivos:** Firebase Storage
- **Hosting:** Firebase + Vercel
- **Otros:** PWA, ESLint, Git, GitHub

---

## Estructura del Proyecto (Extracto)

```
/pages
  └── page.js
  └── layout.js

/components
  └── PublicLibraryBox.js
  └── LoginBox.js

/administrador
  └── adminmanager
    └── page.js
  └── directiva
    └── DirectivForm.js
  └── socios
    └── SociosForm.js
  └── page.js
  
/biblioteca
  └── arte
    └── page.js
  └── cosmovision
    └── page.js
  └── cuentos-leyendas
    └── page.js
  └── historia
    └── page.js
  └── idioma
    └── page.js
  └── investigaciones
    └── page.js
  └── page.js

  /dashboard\[cpmmunityId]
  └── directiva
    └── page.js
  └── documentos
    └── page.js
  └── eventos
    └── page.js
  └── libros
    └── page.js
  └── proyectos
    └── page.js
  └── tesoreria
    └── page.js
  └── layout.js
  └── page.js
     
/perfil
  └── page.js

/ayuda
  └── page.js


/lib
  └── firebase.js

/styles
  └── globals.css

/public
  └── iconos e imágenes propios sin derechos de terceros
```

> *Nota:* Solo se incluyen archivos esenciales que prueban la autoría, omitiendo claves privadas o configuraciones sensibles.

---

## Autor y Derechos

- **Nombre completo:** Alian Andahur Colpiante Rumian  
- **RUT:** 18.964.178-8  
- **Correo:** alian.andahur.lml@gmail.com  
- **Fecha de creación del software:** Abril – Julio 2025  
- **Titular de los derechos:** Alian Andahur Colpiante Rumian

Todo el software fue desarrollado desde cero por el autor. No se utilizaron imágenes, recursos ni códigos de terceros protegidos por derechos de autor. Todas las interfaces, funciones y recursos visuales fueron creados específicamente para este proyecto.

---

## Observaciones

El sistema está en producción, alojado en [https://pualwe-app.vercel.app](https://alian-andahur.vercel.app) y ha sido implementado con éxito en comunidades del sur de Chile. Este documento respalda la autoría del software para efectos de inscripción en el Departamento de Derechos Intelectuales de Chile.

---

## Firma del autor

Alian Andahur  
Fecha: [Completa con la fecha del día en que lo registres]
