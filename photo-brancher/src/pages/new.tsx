import { UseState } from "@custom-express/frontend-thingies";
import { GetSet } from "@custom-express/better-standard-library";

import '@pqina/pintura/pintura.css';
import { getEditorDefaults } from '@pqina/pintura';
import { PinturaEditor } from '@pqina/react-pintura';

class Node<T> {
  public data: GetSet<T>;
  public nodes: GetSet<Node<T>[]> = new GetSet<Node<T>[]>([]);
  public parent?: Node<T>;
  constructor(data: T, parent?: Node<T>) {
    this.data = new GetSet(data);
    this.parent = parent;
  }
}

type PhotoData = { photo: string; editState?: any };

export default function H() {
  const rootState = UseState(new Node<PhotoData>({ photo: 'Initial Photo' }));
  const currentNode = UseState(rootState.get());

  const addAction = (photo: string, imageState?: any) => {
    const newNode = new Node<PhotoData>({ photo, editState: imageState }, currentNode.get());
    currentNode.get().nodes.set([...currentNode.get().nodes.get(), newNode]);
    currentNode.set(newNode);
  };

  const goToNode = (node: Node<PhotoData>) => currentNode.set(node);
  const deleteSubtree = (node: Node<PhotoData>, parent?: Node<PhotoData>) => {
    if (parent) {
      parent.nodes.set(parent.nodes.get().filter(n => n !== node));
    }
  };
  const renderNodeTree = (node: Node<PhotoData>) => (
    <div className="ml-2 border-l border-gray-400 pl-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => goToNode(node)}
          className={`text-sm ${node === currentNode.get() ? "text-red-500" : "text-gray-700"}`}
        >
          {node.data.get().photo}
        </button>
        {node !== rootState.get() && (
          <button
            onClick={() => deleteSubtree(node, node.parent)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        )}
      </div>
      {node.nodes.get().map((child, idx) => (
        <div key={idx}>{renderNodeTree(child)}</div>
      ))}
    </div>
  );

  const editorConfig = {
    ...getEditorDefaults(),
    src: currentNode.get().data.get().photo,
    imageState: currentNode.get().data.get().editState,
    locale: { ...getEditorDefaults().locale, labelButtonExport: 'Save' },
    onProcess: ({ dest, imageState }) => {
      const reader = new FileReader();
      reader.onload = () => addAction(reader.result as string, imageState);
      reader.readAsDataURL(dest);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-[70%] p-4 border-r border-gray-300">
        <h1 className="text-xl font-bold mb-4">Photo Editor</h1>
        <div className="h-[500px]">
          <PinturaEditor {...editorConfig} />
        </div>
      </div>
      <div className="w-[30%] p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Graph View</h2>
        {renderNodeTree(rootState.get())}
      </div>
    </div>
  );
}
