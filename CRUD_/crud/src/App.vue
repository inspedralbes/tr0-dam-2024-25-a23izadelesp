<template>
  <div class="container"> <!-- Contenedor principal -->
    <h1 class="title">CRUD Preguntas Marca</h1> <!-- Título del componente -->

    <div class="button-group">
      <button class="btn btn-add" @click="agregarPregunta"> <!-- Botón para añadir una nueva pregunta -->
        ➕ Añadir Pregunta
      </button>

      <button class="btn btn-stats" @click="mostrarEstadisticas"> <!-- Botón para mostrar estadísticas -->
        📊 Estadísticas
      </button>
    </div>

    <!-- Modal para mostrar la gráfica de estadísticas -->
    <transition name="fade">
      <div v-if="mostrarGrafica" class="modal-overlay">
        <div class="modal">
          <h2>Estadísticas</h2>
          <div v-if="graficaUrl">
            <img :src="graficaUrl" alt="Gráfica de Estadísticas" class="grafica-imagen" />
          </div>
          <div v-else>
            <p>No se pudo cargar la gráfica.</p>
          </div>
          <button class="btn btn-cancel" @click="cerrarGrafica">Cerrar</button>
        </div>
      </div>
    </transition>

    <div class="preguntas-list"> <!-- Contenedor para la lista de preguntas -->
      <transition name="fade"> <!-- Transición suave para la lista -->
        <div v-if="preguntes.length" class="preguntas-list"> <!-- Muestra la lista si hay preguntas -->
          <div v-for="(pregunta, index) in preguntes" :key="index" class="card"> <!-- Itera sobre las preguntas -->
            <div class="card-body"> <!-- Cuerpo de la tarjeta -->
              <h3 class="card-title">{{ pregunta.pregunta }}</h3> <!-- Muestra la pregunta -->

              <div class="respuestas"> <!-- Contenedor para las respuestas -->
                <div class="respuesta-correcta"> <!-- Respuesta correcta -->
                  <h4>Respuesta Correcta:</h4>
                  <p>{{ pregunta.resposta_correcta[0].resposta }}</p> <!-- Muestra la respuesta correcta -->
                  <img
                    :src="pregunta.resposta_correcta[0].imatge" 
                    alt="Imagen respuesta correcta"
                    class="imagen"
                  />
                </div>

                <div class="respuestas-incorrectas"> <!-- Contenedor para respuestas incorrectas -->
                  <h4>Respuestas Incorrectas:</h4>
                  <div
                    v-for="(incorrecte, iIndex) in pregunta.respostes_incorrectes" :key="iIndex" 
                    class="respuesta-incorrecta"
                  >
                    <p>{{ incorrecte.resposta }}</p> <!-- Muestra la respuesta incorrecta -->
                    <img
                      :src="incorrecte.imatge" 
                      alt="Imagen respuesta incorrecta"
                      class="imagen"
                    />
                  </div>
                </div>
              </div>

              <div class="acciones"> <!-- Contenedor para acciones (editar y eliminar) -->
                <button class="btn btn-edit" @click="editarPregunta(index)"> <!-- Botón para editar la pregunta -->
                  ✏️ Editar
                </button>
                <button class="btn btn-delete" @click="eliminarPregunta(index)"> <!-- Botón para eliminar la pregunta -->
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-preguntas"> <!-- Mensaje si no hay preguntas -->
          <p>No hay preguntas disponibles. ¡Añade una nueva pregunta!</p>
        </div>
      </transition>
    </div>

    <transition name="fade"> <!-- Transición suave para el modal -->
      <div v-if="modoEdicion" class="modal-overlay"> <!-- Overlay del modal -->
        <div class="modal"> <!-- Contenedor del modal -->
          <h2>{{ editandoIndex !== null ? 'Editar Pregunta' : 'Añadir Pregunta' }}</h2> <!-- Título del modal -->
          <form @submit.prevent="guardarPregunta"> <!-- Formulario que previene el comportamiento por defecto al enviar -->
            <div class="form-group"> <!-- Grupo de formulario para la pregunta -->
              <label for="pregunta">Pregunta:</label>
              <input
                type="text"
                id="pregunta"
                v-model="preguntaForm.pregunta" 
                class="form-control"
                placeholder="Ingrese la pregunta"
                required
              />
            </div>

            <div class="form-group"> <!-- Grupo de formulario para la respuesta correcta -->
              <label for="respuesta-correcta">Respuesta Correcta:</label>
              <input
                type="text"
                id="respuesta-correcta"
                v-model="preguntaForm.resposta_correcta[0].resposta" 
                class="form-control"
                placeholder="Respuesta correcta"
                required
              />
              <input
                type="url"
                id="imagen-correcta"
                v-model="preguntaForm.resposta_correcta[0].imatge" 
                class="form-control"
                placeholder="URL de la imagen"
                required
              />
            </div>

            <div class="form-group"> <!-- Grupo para respuestas incorrectas -->
              <label>Respuestas Incorrectas:</label>
              <div
                v-for="(incorrecte, i) in preguntaForm.respostes_incorrectes" :key="i" 
                class="respuesta-incorrecta-form"
              >
                <input
                  type="text"
                  v-model="preguntaForm.respostes_incorrectes[i].resposta" 
                  placeholder="Respuesta incorrecta"
                  required
                />
                <input
                  type="url"
                  v-model="preguntaForm.respostes_incorrectes[i].imatge"
                  placeholder="URL de la imagen"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn btn-save"> <!-- Botón para guardar o actualizar -->
              {{ editandoIndex !== null ? 'Actualizar Pregunta' : 'Guardar Pregunta' }} <!-- Muestra texto dinámico -->
            </button>
            <button type="button" class="btn btn-cancel" @click="cerrarModal"> <!-- Botón para cerrar el modal -->
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </transition>

    <div v-if="cargando" class="loading-overlay"> <!-- Overlay de carga -->
      <div class="spinner"></div> <!-- Spinner que indica carga -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // Importar funciones necesarias de Vue

export default {
  setup() {
    // Definición de variables reactivas
    const preguntes = ref([]); // Almacena la lista de preguntas
    const modoEdicion = ref(false); // Controla el estado de edición (añadir/editar)
    const editandoIndex = ref(null); // Guarda el índice de la pregunta que se está editando
    const cargando = ref(false); // Controla el estado de carga para mostrar un spinner

    // Variables para las estadísticas
    const mostrarGrafica = ref(false); // Controla la visibilidad del modal de estadísticas
    const graficaUrl = ref(''); // URL de la gráfica obtenida

    // Estructura del formulario para añadir o editar preguntas
    const preguntaForm = ref({
      pregunta: '', // Texto de la pregunta
      resposta_correcta: [{ resposta: '', imatge: '' }], // Respuesta correcta
      respostes_incorrectes: [ // Respuestas incorrectas
        { resposta: '', imatge: '' },
        { resposta: '', imatge: '' },
        { resposta: '', imatge: '' }
      ]
    });

    // Función para cargar preguntas desde la API
    const cargarPreguntes = async () => {
      cargando.value = true; // Indicamos que estamos en proceso de carga
      try {
        // Realizamos una solicitud a la API para obtener las preguntas
        const response = await fetch('http://a23izadelesp.dam.inspedralbes.cat:20007/preguntes');
        const data = await response.json(); // Convertimos la respuesta a JSON
        // Verificamos si el formato de los datos es correcto
        if (data.preguntes) {
          preguntes.value = data.preguntes; // Asignamos las preguntas a la variable reactiva
        } else {
          console.error('Formato de datos inesperado:', data); // Mensaje de error en caso de formato inesperado
        }
      } catch (error) {
        console.error('Error al cargar preguntas:', error); // Manejo de errores durante la carga
      } finally {
        cargando.value = false; // Terminamos el estado de carga
      }
    };

    // Función para agregar una nueva pregunta
    const agregarPregunta = () => {
      modoEdicion.value = true; // Activamos el modo de edición
      editandoIndex.value = null; // Reiniciamos el índice de edición
      resetForm(); // Reiniciamos el formulario
    };

    // Función para editar una pregunta existente
    const editarPregunta = (index) => {
      modoEdicion.value = true; // Activamos el modo de edición
      editandoIndex.value = index; // Guardamos el índice de la pregunta que se edita
      preguntaForm.value = JSON.parse(JSON.stringify(preguntes.value[index])); // Clonamos la pregunta a editar para evitar referencias
    };

    // Función para guardar una pregunta (añadir o actualizar)
    const guardarPregunta = async () => {
      cargando.value = true; // Indicamos que estamos en proceso de carga
      try {
        if (editandoIndex.value !== null) { // Si estamos editando
          // Realizamos una solicitud PUT para actualizar la pregunta
          await fetch(`http://a23izadelesp.dam.inspedralbes.cat:20007/preguntes/${editandoIndex.value}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json' // Especificamos el tipo de contenido
            },
            body: JSON.stringify(preguntaForm.value) // Enviamos los datos en formato JSON
          });
          alert('Pregunta actualizada correctamente'); // Mensaje de éxito
        } else {
          // Realizamos una solicitud POST para crear una nueva pregunta
          await fetch('http://a23izadelesp.dam.inspedralbes.cat:20007/preguntes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json' // Especificamos el tipo de contenido
            },
            body: JSON.stringify(preguntaForm.value) // Enviamos los datos en formato JSON
          });
          alert('Pregunta creada correctamente'); // Mensaje de éxito
        }
        await cargarPreguntes(); // Recargamos la lista de preguntas
        cerrarModal(); // Cerramos el modal
      } catch (error) {
        console.error('Error al guardar la pregunta:', error); // Manejo de errores durante el guardado
      } finally {
        cargando.value = false; // Terminamos el estado de carga
      }
    };

    // Función para eliminar una pregunta
    const eliminarPregunta = async (index) => {
      cargando.value = true; // Indicamos que estamos en proceso de carga
      try {
        // Realizamos una solicitud DELETE para eliminar la pregunta
        await fetch(`http://a23izadelesp.dam.inspedralbes.cat:20007/preguntes/${index}`, {
          method: 'DELETE'
        });
        await cargarPreguntes(); // Recargamos la lista de preguntas
        alert('Pregunta eliminada correctamente'); // Mensaje de éxito
      } catch (error) {
        console.error('Error al eliminar la pregunta:', error); // Manejo de errores durante la eliminación
      } finally {
        cargando.value = false; // Terminamos el estado de carga
      }
    };

    // Función para cerrar el modal de edición
    const cerrarModal = () => {
      modoEdicion.value = false; // Desactivamos el modo de edición
      resetForm(); // Reiniciamos el formulario
    };

    // Función para reiniciar el formulario
    const resetForm = () => {
      preguntaForm.value = { // Reiniciamos la estructura del formulario
        pregunta: '',
        resposta_correcta: [{ resposta: '', imatge: '' }],
        respostes_incorrectes: [
          { resposta: '', imatge: '' },
          { resposta: '', imatge: '' },
          { resposta: '', imatge: '' }
        ]
      };
    };

    // Función para mostrar las estadísticas
    const mostrarEstadisticas = async () => {
      cargando.value = true; // Indicamos que estamos en proceso de carga
      try {
        const response = await fetch('http://a23izadelesp.dam.inspedralbes.cat:20007/mostrar-grafica');

        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.statusText}`);
        }

        // Asumimos que la API devuelve una URL de la imagen de la gráfica
        const data = await response.json();

        if (data.graficaUrl) {
          graficaUrl.value = data.graficaUrl;
        } else {
          // Si la API devuelve directamente la imagen como Blob
          const blob = await response.blob();
          graficaUrl.value = URL.createObjectURL(blob);
        }

        mostrarGrafica.value = true; // Mostramos el modal de la gráfica
      } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
        alert('No se pudieron cargar las estadísticas.');
      } finally {
        cargando.value = false; // Terminamos el estado de carga
      }
    };

    // Función para cerrar el modal de estadísticas
    const cerrarGrafica = () => {
      mostrarGrafica.value = false;
      graficaUrl.value = '';
    };

    // Función que se ejecuta al montar el componente
    onMounted(cargarPreguntes); // Cargamos las preguntas al iniciar

    // Retornamos las variables y funciones para hacerlas accesibles en el template
    return {
      preguntes,
      modoEdicion,
      editandoIndex,
      cargando,
      preguntaForm,
      cargarPreguntes,
      agregarPregunta,
      editarPregunta,
      guardarPregunta,
      eliminarPregunta,
      cerrarModal,
      mostrarEstadisticas,
      mostrarGrafica,
      graficaUrl,
      cerrarGrafica
    };
  }
};
</script>

<style scoped>
/* Estilos existentes */

.container {
  max-width: 800px; /* Ancho máximo del contenedor */
  margin: 0 auto; /* Centramos el contenedor */
  padding: 20px; /* Espaciado interno */
  background-color: #f9f9f9; /* Color de fondo más suave */
  border-radius: 10px; /* Bordes redondeados */
}

.title {
  text-align: center; /* Centramos el texto del título */
  color: #333; /* Color de texto más oscuro */
  font-size: 2rem; /* Tamaño de fuente del título */
  margin-bottom: 20px; /* Espacio inferior */
}

.btn {
  background-color: #3b3b3b; /* Color de fondo del botón */
  color: white; /* Color del texto del botón */
  padding: 10px 15px; /* Espaciado interno del botón */
  border: none; /* Sin borde */
  border-radius: 5px; /* Bordes redondeados del botón */
  cursor: pointer; /* Cambiamos el cursor al pasar por encima */
  transition: background-color 0.3s, transform 0.3s; /* Añadir animación de transformación */
}

.btn:hover {
  background-color: #585858; /* Color de fondo del botón al pasar el ratón */
  transform: translateY(-2px); /* Efecto de elevación al pasar el ratón */
}

.btn-add {
  margin-bottom: 20px; /* Espacio inferior para el botón de añadir */
}

.btn-stats {
  margin-left: 10px; /* Espacio izquierdo para separar de otros botones */
}

.preguntas-list {
  margin-bottom: 20px; /* Espacio inferior para la lista de preguntas */
}

.card {
  border: 1px solid #ccc; /* Borde de la tarjeta */
  border-radius: 5px; /* Bordes redondeados de la tarjeta */
  padding: 15px; /* Espaciado interno de la tarjeta */
  margin-bottom: 20px; /* Espacio inferior entre tarjetas */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra de la tarjeta */
  transition: transform 0.3s, box-shadow 0.3s; /* Animación de transformación para tarjeta */
}

.card:hover {
  transform: translateY(-5px); /* Efecto de elevación al pasar el ratón */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Aumento de la sombra al pasar el ratón */
}

.card-title {
  font-size: 1.5rem; /* Tamaño de la fuente del título de la tarjeta */
  margin-bottom: 10px; /* Espacio inferior del título */
}

.respuestas {
  margin: 10px 0; /* Espaciado vertical entre respuestas */
}

.respuesta-correcta,
.respuestas-incorrectas {
  margin-bottom: 15px; /* Espacio inferior entre secciones de respuestas */
}

.imagen {
  max-width: 100px; /* Ajusta el tamaño máximo de la imagen */
  max-height: 80px; /* Ajusta la altura máxima de la imagen */
  border-radius: 5px; /* Bordes redondeados para las imágenes */
}

.acciones {
  margin-top: 10px; /* Espacio superior para las acciones */
}

.modal-overlay {
  position: fixed; /* Posición fija para cubrir toda la pantalla */
  top: 0; /* Alineado al borde superior */
  left: 0; /* Alineado al borde izquierdo */
  width: 100%; /* Ancho completo */
  height: 100%; /* Alto completo */
  background: rgba(0, 0, 0, 0.5); /* Fondo semi-transparente */
  display: flex; /* Usamos flexbox para centrar el modal */
  justify-content: center; /* Centrado horizontal */
  align-items: center; /* Centrado vertical */
}

.modal {
  background: white; /* Fondo blanco del modal */
  padding: 30px; /* Espaciado interno del modal */
  border-radius: 8px; /* Bordes redondeados del modal */
  width: 90%; /* Ancho del modal */
  max-width: 600px; /* Ancho máximo del modal */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Sombra del modal */
}

.grafica-imagen {
  max-width: 100%;
  height: auto;
  margin-bottom: 20px;
}

.loading-overlay {
  position: fixed; /* Posición fija para cubrir toda la pantalla */
  top: 0; /* Alineado al borde superior */
  left: 0; /* Alineado al borde izquierdo */
  width: 100%; /* Ancho completo */
  height: 100%; /* Alto completo */
  background: rgba(255, 255, 255, 0.8); /* Fondo semi-transparente blanco */
  display: flex; /* Usamos flexbox para centrar el spinner */
  justify-content: center; /* Centrado horizontal */
  align-items: center; /* Centrado vertical */
}

.spinner {
  border: 5px solid #f3f3f3; /* Color gris claro */
  border-top: 5px solid #3498db; /* Color azul en la parte superior */
  border-radius: 50%; /* Forma circular */
  width: 40px; /* Ancho del spinner */
  height: 40px; /* Alto del spinner */
  animation: spin 1s linear infinite; /* Animación de giro */
}

.no-preguntas {
  text-align: center; /* Centramos el texto */
  font-size: 1.2rem; /* Tamaño de la fuente */
  color: #666; /* Color gris para el texto */
}

/* Estilos para la transición de desvanecimiento */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s; /* Transición suave para la opacidad */
}

.fade-enter,
.fade-leave-to /* .fade-leave-active en <2.1.8 */ {
  opacity: 0; /* Totalmente transparente al entrar/salir */
}

/* Estilos adicionales para formularios */
.form-group {
  margin-bottom: 15px; /* Espacio inferior entre grupos de formulario */
}

.form-control {
  width: 100%; /* Ancho completo para los controles */
  padding: 10px; /* Espaciado interno de los controles */
  border: 1px solid #ccc; /* Borde de los controles */
  border-radius: 5px; /* Bordes redondeados de los controles */
}

.button-group {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

.btn-stats {
  background-color: #3498db; /* Color de fondo para el botón de estadísticas */
}

.btn-stats:hover {
  background-color: #2980b9; /* Color de fondo al pasar el ratón */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
