// Función que realiza la búsqueda en el servidor
function buscarTareas() {
    const searchTerm = document.getElementById('search').value;

    // Hacer una solicitud GET para obtener las tareas filtradas por título
    fetch(`/tbl_tareas?search=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('tabla-tareas');
        tbody.innerHTML = '';

        data.forEach(tarea => {
          const row = document.createElement('tr');
          row.id = `tarea-${tarea.id}`;

          row.innerHTML = `
            <td>${tarea.id}</td>
            <td>${tarea.titulo}</td>
            <td>${tarea.descripcion}</td>
            <td class="acciones">
                <button onclick="verTarea(${tarea.id})">Ver</button>
                <button onclick="editarTarea(${tarea.id})">Editar</button>
                <button class="delete" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
            </td>
            
          `;
          tbody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error al cargar las tareas:', error);
      });
  }

  // Función para obtener tarea por ID
function verTarea(id) {
    fetch(`/tbl_tareas/${id}`)
      .then(response => response.json())
      .then(tarea => {
        alert(`ID: ${tarea.id}\nTítulo: ${tarea.titulo}\nDescripción: ${tarea.descripcion}`);
      })
      .catch(error => {
        console.error('Error al obtener la tarea:', error);
      });
  }
  
  // Función para editar tarea
  function editarTarea(id) {
    const nuevoTitulo = prompt('Nuevo título:');
    const nuevaDescripcion = prompt('Nueva descripción:');
    
    if (nuevoTitulo && nuevaDescripcion) {
      fetch(`/tbl_tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
      })
      .then(response => response.json())
      .then(() => {
        alert('Tarea actualizada');
        const fila = document.querySelector(`#tarea-${id}`);
            if (fila) {
                fila.querySelector('.titulo').textContent = nuevoTitulo;
                fila.querySelector('.descripcion').textContent = nuevaDescripcion;
             }

      })
      .catch(error => {
        console.error('Error al editar la tarea:', error);
      });
    }
  }
  
  // Función para eliminar tarea
  function eliminarTarea(id) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
    if (confirmacion) {
      fetch(`/tbl_tareas/${id}`, {
        method: 'DELETE',
      })
      .then(() => {
        alert('Tarea eliminada');
        buscarTareas();
      })
      .catch(error => {
        console.error('Error al eliminar la tarea:', error);
      });
    }
  }

  // Función para crear una nueva tarea
function crearTarea() {
    const nuevoTitulo = prompt('Ingrese el título de la nueva tarea:');
    const nuevaDescripcion = prompt('Ingrese la descripción de la nueva tarea:');
    
    if (nuevoTitulo && nuevaDescripcion) {
      // Hacer solicitud POST para crear una nueva tarea
      fetch('/tbl_tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
      })
      .then(response => response.json())
      .then(data => {
        alert('Tarea creada exitosamente');
        buscarTareas(); 
      })
      .catch(error => {
        console.error('Error al crear la tarea:', error);
      });
    }
  }
  
  
  // Cargar todas las tareas inicialmente (sin filtro)
  document.addEventListener('DOMContentLoaded', buscarTareas);