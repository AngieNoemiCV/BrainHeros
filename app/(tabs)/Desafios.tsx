import { useNavigation, useRoute } from '@react-navigation/native'; // Importamos useRoute para obtener los parámetros
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase

export default function Desafios() {
  const route = useRoute(); // Usamos useRoute para obtener los parámetros
  const navigation = useNavigation();
  const { nivelId } = route.params; // Extraemos el nivelId de los parámetros
  const [desafioActual, setDesafioActual] = useState(0);
  const [desafios, setDesafios] = useState([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [alaprimera, setalaprimera] = useState(true);


  // Verificar si hay una sesión abierta
  useEffect(() => {
    setDesafioActual(0)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (!session) {
        navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      } else {
        console.log("Usuario logueado");
        //console.log("Usuario logueado", session);
      }
    };

    checkSession(); // Llamamos a la función para verificar la sesión
  }, []);

  // Obtener los desafíos del nivel actual desde la base de datos
  useEffect(() => {
    const fetchDesafios = async () => {
      // Paso 1: Obtener todas las preguntas del nivel actual
      const { data: preguntas, error: preguntasError } = await supabase
        .from('QuestionsTable')
        .select('id_question, question')
        .eq('level', nivelId); // Filtramos por el nivel recibido en los parámetros

      if (preguntasError) {
        console.error('Error al obtener las preguntas:', preguntasError.message);
        return;
      }

      if (!preguntas || preguntas.length === 0) {
        console.warn('No se encontraron preguntas para el nivel:', nivelId);
        return;
      }

      // Paso 2: Mezclar las preguntas aleatoriamente y tomar las primeras 10
      const preguntasAleatorias = preguntas
        .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
        .slice(0, 10); // Tomar máximo 10 preguntas

      // Paso 3: Obtener las opciones de cada pregunta
      const preguntasConOpciones = await Promise.all(
        preguntasAleatorias.map(async (pregunta: any) => {
          const { data: opciones, error: opcionesError } = await supabase
            .from('OptionsTable')
            .select('id_option, option_text, is_correct')
            .eq('fk_id_question', pregunta.id_question); // Relacionar opciones con la pregunta por id_question

          if (opcionesError) {
            console.error('Error al obtener las opciones:', opcionesError.message);
            return { ...pregunta, opciones: [] }; // En caso de error, regresar la pregunta sin opciones
          }

          // Retornamos la pregunta con las opciones correspondientes
          return {
            id: pregunta.id_question,
            pregunta: pregunta.question,
            opciones: opciones.map((opcion: any) => ({
              id: opcion.id_option,
              texto: opcion.option_text,
              esCorrecta: opcion.is_correct,
            })),
          };
        })
      );

      // Guardar los desafíos en el estado
      setDesafios(preguntasConOpciones);
    };

    fetchDesafios();
  }, [nivelId]);


  // Función para verificar la respuesta
  const verificarRespuesta = async () => {
    const desafio = desafios[desafioActual];
    const opcionCorrecta = desafio.opciones.find((opcion: any) => opcion.esCorrecta);

    if (respuestaSeleccionada === opcionCorrecta.texto) {
      // El usuario respondió correctamente
      if (alaprimera) {
        try {
          // Incrementar aciertos
          // Pasar el ID de la pregunta como parámetro
          const { error: aciertosError } = await supabase.rpc('incrementar_aciertos', {
            p_id_question: desafio.id, // Pasar el ID de la pregunta como parámetro
          });

          if (aciertosError) {
            console.error('Error al incrementar aciertos:', aciertosError.message);
          } else {
            console.log('Acierto registrado correctamente.');
          }
        } catch (error) {
          console.error('Error al actualizar aciertos:', error);
        }
      }

      if (desafioActual < desafios.length - 1) {
        Alert.alert('¡Correcto!', 'Has respondido correctamente.');
        setDesafioActual(desafioActual + 1);
        setRespuestaSeleccionada(null);
        setalaprimera(true)
      } else {
        Alert.alert(
          '¡Felicitaciones!',
          'Has completado todos los desafíos de este nivel.',
          [
            {
              text: 'OK',
              onPress: async () => {
                const { data: session } = await supabase.auth.getSession();
                const user = session?.session?.user;

                if (user) {
                  const { error: updateError } = await supabase
                    .from('ProgressTable')
                    .update({ completed: true })
                    .eq('email', user.email)
                    .eq('level_number', nivelId);

                  if (updateError) {
                    console.log('Error al actualizar el progreso:', updateError.message);
                  } else {
                    console.log('Progreso actualizado exitosamente');
                    navigation.navigate('Niveles');
                  }
                } else {
                  console.log('Error al obtener la sesión del usuario.');
                }
              },
            },
          ]
        );
        setDesafioActual(0);
      }
    } else {
      // El usuario respondió incorrectamente

      if (alaprimera) {
        try {
          const { error: aciertosError } = await supabase.rpc('incrementar_equivocaciones', {
            p_id_question: desafio.id, // Pasar el ID de la pregunta como parámetro
          });
          setalaprimera(false)

          if (aciertosError) {
            console.error('Error al incrementar equivocaciones:', aciertosError.message);
          } else {
            console.log('Equivocación registrada correctamente.');
          }
        } catch (error) {
          console.error('Error al actualizar equivocaciones:', error);
        }
      }

      Alert.alert('Incorrecto', 'La respuesta correcta era: ' + opcionCorrecta.texto);
    }
  };

  if (desafios.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.nivelText}>Cargando desafíos...</Text>
      </View>
    );
  }


  const desafio = desafios[desafioActual];

  return (
    <View style={styles.container}>
      <Text style={styles.nivelText}>Desafíos para el Nivel {nivelId}</Text>
      <Text style={styles.pregunta}>{desafio.pregunta}</Text>

      {/* Opciones de respuesta */}
      {desafio.opciones.map((opcion: any) => (
        <TouchableOpacity
          key={opcion.id}
          style={[
            styles.opcion,
            respuestaSeleccionada === opcion.texto ? styles.opcionSeleccionada : null,
          ]}
          onPress={() => setRespuestaSeleccionada(opcion.texto)}
        >
          <Text style={styles.opcionTexto}>{opcion.texto}</Text>
        </TouchableOpacity>
      ))}

      {/* Botón para enviar la respuesta */}
      <TouchableOpacity
        style={styles.botonEnviar}
        onPress={verificarRespuesta}
        disabled={respuestaSeleccionada === null}
      >
        <Text style={styles.botonTexto}>Enviar Respuesta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  nivelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27613C',
    marginBottom: 20,
    textAlign: 'center',
  },
  pregunta: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  opcion: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  opcionSeleccionada: {
    backgroundColor: '#4CAF50',
  },
  opcionTexto: {
    fontSize: 18,
    textAlign: 'center',
  },
  botonEnviar: {
    backgroundColor: '#27613C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
