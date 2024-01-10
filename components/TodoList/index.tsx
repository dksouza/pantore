import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import uuid from "react-native-uuid";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

interface ItemProps {
  id?: any;
  title?: string;
  description?: string;
  status?: boolean;
  file?: any;
}

const TodoList = () => {
  const [todos, setTodos] = useState<ItemProps[]>([]);
  const [todosFiltered, setTodosFiltered] = useState<ItemProps[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [uriUpload, setUriUpload] = useState(null);

  const [filtered, setFiltered] = useState(false);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.error("Permissão negada para acessar a biblioteca de mídia");
      return;
    }

    const result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      // O arquivo foi selecionado com sucesso, agora você pode salvá-lo localmente.
      saveFileLocally(result.uri);
    }
  };

  const saveFileLocally = async (uri: any) => {
    const fileName = uri.split("/").pop(); // Obtém o nome do arquivo da URI
    const localUri = FileSystem.cacheDirectory + fileName;

    try {
      await FileSystem.copyAsync({
        from: uri,
        to: localUri,
      });

      // Agora você pode usar `localUri` para exibir o arquivo na sua tela.
      console.log("Arquivo salvo localmente:", localUri);
      setUriUpload(localUri);
    } catch (error) {
      console.error("Erro ao salvar o arquivo localmente:", error);
    }
  };

  const Item = (item: ItemProps) => (
    <TouchableOpacity onPress={() => markFinished(item.id)} testID="btn-item">
      <View style={item.status ? styles.itemChecked : styles.item}>
        <View>
          <Text style={styles.title}>Título: {item.title}</Text>
          {item.description && (
            <Text style={styles.title}>Descrição: {item.description}</Text>
          )}
          <Text style={styles.title}>
            Status: {item.status ? "CONCLUÍDO" : "PENDENTE"}
          </Text>
          {item.file && (
            <Image
              source={{ uri: item.file }}
              style={{ width: 60, height: 60 }}
            />
          )}
        </View>
        <View>
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            testID="btn-delete"
          >
            <AntDesign name="delete" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const addItem = () => {
    setTodos([
      ...todos,
      {
        id: uuid.v4(),
        title,
        description,
        status: false,
        file: uriUpload,
      },
    ]);
    setTitle("");
    setDescription("");
    setUriUpload(null);
    Keyboard.dismiss();
  };

  const removeItem = (id: string) => {
    const filtered = todos.filter((item) => item.id !== id);
    setTodos(filtered);
  };

  const filterFinished = () => {
    setFiltered(!filtered);
    const filter = todos.filter((item) => item.status === true);
    setTodosFiltered(filter);
  };

  const markFinished = (id: string) => {
    const index = todos.findIndex((obj) => obj.id === id);
    todos[index].status = !todos[index].status;
    const filter = todos.filter((item) => item.id !== id);
    setTodos(
      [...filter, todos[index]].sort((a: any, b: any) => b.status - a.status),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content} testID="view-content">
        <TextInput
          placeholder="Titulo da tarefa"
          style={styles.inputText}
          onChangeText={setTitle}
          value={title}
          testID="input-title"
        />
        <TextInput
          placeholder="Descrição da tarefa"
          style={styles.inputText}
          onChangeText={setDescription}
          value={description}
          testID="input-description"
        />
        <TouchableOpacity
          style={styles.buttonFilter}
          onPress={() => pickMedia()}
          testID="pick-image"
        >
          <Text style={styles.textButtonFilter}>Anexar arquivo</Text>
        </TouchableOpacity>
        {uriUpload && (
          <Image
            source={{ uri: uriUpload }}
            style={{ width: 60, height: 60 }}
            testID="image"
          />
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => addItem()}
          disabled={title === ""}
          testID="btn-add-item"
        >
          <Text style={styles.textButton}>Adicionar nova tarefa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonFilter}
          onPress={() => filterFinished()}
          testID="btn-filter"
        >
          <Text style={styles.textButtonFilter}>
            {filtered ? "Listar tudo" : "Filtrar por concluídos"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered ? todosFiltered : todos}
        renderItem={({ item }) => (
          <Item
            title={item.title}
            description={item.description}
            status={item.status}
            id={item.id}
            file={item.file}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

var width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  content: {
    width: width - 20,
  },
  item: {
    backgroundColor: "#ededed",
    padding: 20,
    marginVertical: 8,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  itemChecked: {
    backgroundColor: "#d7fc7e",
    padding: 20,
    marginVertical: 8,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  title: {
    fontSize: 18,
  },
  inputText: {
    width: "100%",
    paddingVertical: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  button: {
    padding: 20,
    backgroundColor: "#f76c45",
    borderRadius: 4,
  },
  buttonFilter: {
    padding: 20,
    borderRadius: 4,
  },
  textButton: {
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: "center",
  },
  textButtonFilter: {
    color: "#000000",
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: "center",
  },
  viewItem: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
});

export default TodoList;
