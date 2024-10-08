import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

// Definimos la interfaz de un Desafío
interface Desafio {
  id: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
}

// Lista de desafíos (puedes reemplazar esta lista con datos dinámicos de una API o base de datos)
const desafios: Desafio[] = [
  {
    id: 1,
    pregunta: '¿Cuánto es 5 + 3?',
    opciones: ['6', '7', '8', '9'],
    respuestaCorrecta: '8',
  },
  {
    id: 2,
    pregunta: '¿Cuál es la capital de Francia?',
    opciones: ['Madrid', 'París', 'Berlín', 'Roma'],
    respuestaCorrecta: 'París',
  },
  {
    id: 3,
    pregunta: '¿Cuál es el planeta más cercano al sol?',
    opciones: ['Tierra', 'Marte', 'Venus', 'Mercurio'],
    respuestaCorrecta: 'Mercurio',
  },
  // Agrega más desafíos según sea necesario
];

export default function Desafios({ route }: any) {
  const { nivelId } = 3; //route.params // Recibimos el nivelId desde la pantalla anterior
  const [desafioActual, setDesafioActual] = useState(0); // Seguimiento del desafío actual
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const navigation = useNavigation();

  // Función para verificar la respuesta
  const verificarRespuesta = () => {
    const desafio = desafios[desafioActual];
    if (desafioActual < desafios.length && respuestaSeleccionada === desafio.respuestaCorrecta) {
      Alert.alert(
        '¡Felicitaciones!',
        'Has completado todos los desafíos de este nivel.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Niveles'), // Navegar después de presionar "OK"
          },
        ],
      );
      Alert.alert('¡Correcto!', 'Has respondido correctamente.');
    }

    else if (respuestaSeleccionada === desafio.respuestaCorrecta) {
      Alert.alert('¡Correcto!', 'Has respondido correctamente.');
    } else {
      Alert.alert('Incorrecto', 'La respuesta correcta era: ' + desafio.respuestaCorrecta);
    }

    // Ir al siguiente desafío o finalizar
    if (desafioActual < desafios.length - 1) {
      setDesafioActual(desafioActual + 1);
      setRespuestaSeleccionada(null); // Reseteamos la selección para el próximo desafío
    }
  };

  // Obtener el desafío actual
  const desafio = desafios[desafioActual];

  return (
    <View style={styles.container}>
      <Text style={styles.nivelText}>Desafíos para el Nivel {nivelId}</Text>
      <Text style={styles.pregunta}>{desafio.pregunta}</Text>

      {/* Opciones de respuesta */}
      {desafio.opciones.map((opcion) => (
        <TouchableOpacity
          key={opcion}
          style={[
            styles.opcion,
            respuestaSeleccionada === opcion ? styles.opcionSeleccionada : null,
          ]}
          onPress={() => setRespuestaSeleccionada(opcion)}
        >
          <Text style={styles.opcionTexto}>{opcion}</Text>
        </TouchableOpacity>
      ))}

      {/* Botón para enviar la respuesta */}
      <TouchableOpacity
        style={styles.botonEnviar}
        onPress={verificarRespuesta}
        disabled={respuestaSeleccionada === null} // Deshabilitar si no se ha seleccionado una respuesta
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
